import { useState } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import * as FormComponents from "../components/common/Form";
import { register, createUserSession, getUser } from "../utils/auth.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { calculateMaxHeartRate } from "../utils/heartRate";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) return redirect("/dashboard");
  return json({});
};

const RegisterSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .min(6, { message: "パスワードは6文字以上で入力してください" }),
  name: z.string().min(1, { message: "名前を入力してください" }),
  age: z
    .number({ invalid_type_error: "年齢は数値で入力してください" })
    .int({ message: "年齢は整数で入力してください" })
    .min(10, { message: "年齢は10歳以上で入力してください" })
    .max(100, { message: "年齢は100歳以下で入力してください" }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    invalid_type_error: "性別を選択してください",
  }),
  height: z
    .number({ invalid_type_error: "身長は数値で入力してください" })
    .min(100, { message: "身長は100cm以上で入力してください" })
    .max(250, { message: "身長は250cm以下で入力してください" }),
  weight: z
    .number({ invalid_type_error: "体重は数値で入力してください" })
    .min(30, { message: "体重は30kg以上で入力してください" })
    .max(300, { message: "体重は300kg以下で入力してください" }),
});

type ActionData = {
  formError?: string;
  fieldErrors?: z.ZodFormattedError<z.infer<typeof RegisterSchema>>["fieldErrors"];
  fields?: {
    email: string;
    password: string;
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const ageStr = formData.get("age");
  const gender = formData.get("gender");
  const heightStr = formData.get("height");
  const weightStr = formData.get("weight");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof ageStr !== "string" ||
    typeof gender !== "string" ||
    typeof heightStr !== "string" ||
    typeof weightStr !== "string"
  ) {
    return json<ActionData>(
      { formError: "フォームが正しく送信されませんでした。" },
      { status: 400 }
    );
  }

  const fields = {
    email,
    password,
    name,
    age: ageStr,
    gender,
    height: heightStr,
    weight: weightStr,
  };

  let age: number, height: number, weight: number;
  try {
    age = parseInt(ageStr, 10);
    height = parseFloat(heightStr);
    weight = parseFloat(weightStr);
  } catch (e) {
    return json<ActionData>(
      { 
        formError: "数値の変換に失敗しました。正しい値を入力してください。",
        fields 
      },
      { status: 400 }
    );
  }

  try {
    const result = RegisterSchema.safeParse({
      email,
      password,
      name,
      age,
      gender,
      height,
      weight,
    });

    if (!result.success) {
      return json<ActionData>(
        { 
          fieldErrors: result.error.format().fieldErrors,
          fields 
        },
        { status: 400 }
      );
    }

    const user = await register({
      email,
      password,
      name,
      age,
      gender,
      height,
      weight,
    });

    return createUserSession(user.id, "/dashboard");
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return json<ActionData>(
        { 
          formError: "このメールアドレスは既に使用されています",
          fields 
        },
        { status: 400 }
      );
    }
    return json<ActionData>(
      { 
        formError: `ユーザー登録に失敗しました: ${error.message}`,
        fields 
      },
      { status: 500 }
    );
  }
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
    name: actionData?.fields?.name || "",
    age: actionData?.fields?.age || "",
    gender: actionData?.fields?.gender || "male",
    height: actionData?.fields?.height || "",
    weight: actionData?.fields?.weight || "",
  });

  const [calculatedMaxHeartRate, setCalculatedMaxHeartRate] = useState<number | null>(null);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 年齢が変更されたら最大心拍数を再計算
    if (name === "age" && value) {
      const age = parseInt(value, 10);
      if (!isNaN(age) && age > 0) {
        setCalculatedMaxHeartRate(calculateMaxHeartRate(age));
      } else {
        setCalculatedMaxHeartRate(null);
      }
    }
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          新規ユーザー登録
        </h1>
        
        <FormComponents.Form method="post" noValidate>
          {actionData?.formError ? (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {actionData.formError}
            </div>
          ) : null}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                アカウント情報
              </h2>
            </div>
            
            <FormComponents.FormField error={actionData?.fieldErrors?.email?.toString()}>
              <FormComponents.Label htmlFor="email" required>
                メールアドレス
              </FormComponents.Label>
              <FormComponents.Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.email}
                required
              />
            </FormComponents.FormField>

            <FormComponents.FormField error={actionData?.fieldErrors?.password?.toString()}>
              <FormComponents.Label htmlFor="password" required>
                パスワード
              </FormComponents.Label>
              <FormComponents.Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.password}
                required
              />
            </FormComponents.FormField>

            {/* 個人情報 */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                個人情報
              </h2>
            </div>
            
            <FormComponents.FormField error={actionData?.fieldErrors?.name?.toString()}>
              <FormComponents.Label htmlFor="name" required>
                名前
              </FormComponents.Label>
              <FormComponents.Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.name}
                required
              />
            </FormComponents.FormField>

            <FormComponents.FormField error={actionData?.fieldErrors?.age?.toString()}>
              <FormComponents.Label htmlFor="age" required>
                年齢
              </FormComponents.Label>
              <FormComponents.Input
                id="age"
                name="age"
                type="number"
                min="10"
                max="100"
                value={formData.age}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.age}
                required
              />
              {calculatedMaxHeartRate && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  推定最大心拍数: {calculatedMaxHeartRate} bpm
                </p>
              )}
            </FormComponents.FormField>

            <FormComponents.FormField error={actionData?.fieldErrors?.gender?.toString()}>
              <FormComponents.Label htmlFor="gender" required>
                性別
              </FormComponents.Label>
              <FormComponents.Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.gender}
                required
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
                <option value="prefer_not_to_say">回答しない</option>
              </FormComponents.Select>
            </FormComponents.FormField>

            <FormComponents.FormField error={actionData?.fieldErrors?.height?.toString()}>
              <FormComponents.Label htmlFor="height" required>
                身長 (cm)
              </FormComponents.Label>
              <FormComponents.Input
                id="height"
                name="height"
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={formData.height}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.height}
                required
              />
            </FormComponents.FormField>

            <FormComponents.FormField error={actionData?.fieldErrors?.weight?.toString()}>
              <FormComponents.Label htmlFor="weight" required>
                体重 (kg)
              </FormComponents.Label>
              <FormComponents.Input
                id="weight"
                name="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                error={!!actionData?.fieldErrors?.weight}
                required
              />
            </FormComponents.FormField>
          </div>
          
          <div className="mt-8">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              登録する
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              既にアカウントをお持ちの方は{" "}
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                こちら
              </a>
              からログインしてください。
            </p>
          </div>
        </FormComponents.Form>
      </div>
    </Layout>
  );
}
