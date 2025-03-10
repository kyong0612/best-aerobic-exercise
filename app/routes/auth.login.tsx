import { useState } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import * as FormComponents from "../components/common/Form";
import { login, createUserSession, getUser } from "../utils/auth.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) return redirect("/dashboard");
  return json({});
};

const LoginSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(6, { message: "パスワードは6文字以上で入力してください" }),
  redirectTo: z.string().default("/dashboard"),
});

type ActionData = {
  formError?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  fields?: {
    email: string;
    password: string;
    redirectTo: string;
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/dashboard";

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return json<ActionData>(
      { formError: "フォームが正しく送信されませんでした。" },
      { status: 400 }
    );
  }

  const result = LoginSchema.safeParse({
    email,
    password,
    redirectTo,
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return json<ActionData>(
      { fieldErrors, fields: { email, password, redirectTo } },
      { status: 400 }
    );
  }

  const user = await login({ email, password });
  if (!user) {
    return json<ActionData>(
      {
        formError: "メールアドレスまたはパスワードが正しくありません",
        fields: { email, password, redirectTo },
      },
      { status: 400 }
    );
  }

  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          ログイン
        </h1>
        
        <FormComponents.Form method="post" noValidate>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          
          {actionData?.formError ? (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {actionData.formError}
            </div>
          ) : null}
          
          <FormComponents.FormField error={actionData?.fieldErrors?.email}>
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
          
          <FormComponents.FormField error={actionData?.fieldErrors?.password}>
            <FormComponents.Label htmlFor="password" required>
              パスワード
            </FormComponents.Label>
            <FormComponents.Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!actionData?.fieldErrors?.password}
              required
            />
          </FormComponents.FormField>
          
          <div className="mt-6">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              ログイン
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              アカウントをお持ちでない方は{" "}
              <a
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                こちら
              </a>
              から登録してください。
            </p>
          </div>
        </FormComponents.Form>
      </div>
    </Layout>
  );
}
