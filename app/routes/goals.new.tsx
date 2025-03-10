import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Form as RemixForm, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { requireUserId } from "../utils/auth.server";
import { prisma } from "../utils/db.server";
import Layout from "../components/layout/Layout";
import { Form, FormField, Label, Input, Textarea, Select } from "../components/common/Form";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

// バリデーションスキーマ
const goalSchema = z.object({
  type: z.enum(["weight_loss", "cardio_health", "marathon", "sprint", "custom"], {
    errorMap: () => ({ message: "目標タイプを選択してください" })
  }),
  customDescription: z.string().optional(),
  startDate: z.string({
    required_error: "開始日は必須です"
  }),
  targetDate: z.string().optional(),
});

// サーバーサイドローダー
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 認証チェック
  const userId = await requireUserId(request);
  
  // ユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new Response("ユーザーが見つかりません", { status: 404 });
  }

  return json({ user });
};

// アクション
export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const type = formData.get("type")?.toString() || "";
  const customDescription = formData.get("customDescription")?.toString() || undefined;
  const startDate = formData.get("startDate")?.toString() || "";
  const targetDate = formData.get("targetDate")?.toString() || undefined;

  // バリデーション
  try {
    goalSchema.parse({
      type,
      customDescription,
      startDate,
      targetDate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce((acc, curr) => {
        const field = curr.path[0];
        acc[field] = curr.message;
        return acc;
      }, {} as Record<string, string>);
      
      return json({ errors: fieldErrors });
    }
    return json({ errors: { general: "入力内容を確認してください" } });
  }

  // トレーニング目標の作成
  await prisma.trainingGoal.create({
    data: {
      userId,
      type,
      customDescription,
      startDate: new Date(startDate),
      targetDate: targetDate ? new Date(targetDate) : undefined,
    },
  });

  // ダッシュボードにリダイレクト
  return redirect("/dashboard");
};

// コンポーネント
export default function NewGoal() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [goalType, setGoalType] = useState<string>("weight_loss");
  
  // 今日の日付を取得してHTML date inputのデフォルト値として使用
  const today = new Date().toISOString().split("T")[0];

  return (
    <Layout user={user}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">トレーニング目標の設定</h1>
        
        <Card className="max-w-2xl mx-auto p-6">
          <RemixForm method="post">
            <Form className="space-y-6">
              {/* 目標タイプ選択 */}
              <FormField error={actionData?.errors?.type}>
                <Label htmlFor="type" required>目標タイプ</Label>
                <Select 
                  id="type" 
                  name="type" 
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  error={!!actionData?.errors?.type}
                >
                  <option value="weight_loss">ダイエット・脂肪燃焼</option>
                  <option value="cardio_health">心肺機能向上</option>
                  <option value="marathon">マラソン・長距離レース対策</option>
                  <option value="sprint">短距離・スプリント能力向上</option>
                  <option value="custom">カスタム目標</option>
                </Select>
              </FormField>
              
              {/* カスタム目標の説明（カスタム選択時のみ表示） */}
              {goalType === "custom" && (
                <FormField error={actionData?.errors?.customDescription}>
                  <Label htmlFor="customDescription" required>カスタム目標の詳細</Label>
                  <Textarea
                    id="customDescription"
                    name="customDescription"
                    rows={3}
                    placeholder="あなたのトレーニング目標を詳しく入力してください"
                    error={!!actionData?.errors?.customDescription}
                  />
                </FormField>
              )}
              
              {/* 開始日 */}
              <FormField error={actionData?.errors?.startDate}>
                <Label htmlFor="startDate" required>開始日</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={today}
                  error={!!actionData?.errors?.startDate}
                />
              </FormField>
              
              {/* 目標日（任意） */}
              <FormField error={actionData?.errors?.targetDate}>
                <Label htmlFor="targetDate">目標達成予定日（任意）</Label>
                <Input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  min={today}
                  error={!!actionData?.errors?.targetDate}
                />
                <p className="text-sm text-gray-500 mt-1">
                  目標達成までの期間を設定すると、進捗管理に役立ちます
                </p>
              </FormField>
              
              {/* 目標タイプの説明 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="font-medium mb-2">目標タイプについて</h3>
                <div className="text-sm space-y-2">
                  {goalType === "weight_loss" && (
                    <p>ダイエット・脂肪燃焼プログラムは、有酸素運動を多く取り入れて脂肪燃焼を促進します。低〜中強度のゾーン2でのトレーニングが中心となります。</p>
                  )}
                  {goalType === "cardio_health" && (
                    <p>心肺機能向上プログラムは、あなたの心臓と肺の機能を強化します。ゾーン2〜3の持久力向上トレーニングと、定期的なゾーン4のインターバルトレーニングを組み合わせます。</p>
                  )}
                  {goalType === "marathon" && (
                    <p>マラソン・長距離レース対策プログラムは、長時間の持久力を高めます。ロング走を中心にゾーン2での効率的なランニングと、定期的なゾーン3〜4でのペース走を組み合わせます。</p>
                  )}
                  {goalType === "sprint" && (
                    <p>短距離・スプリント能力向上プログラムは、瞬発力とスピードを高めます。高強度のゾーン4〜5でのインターバルトレーニングと、適切な回復期間を設けた構成になります。</p>
                  )}
                  {goalType === "custom" && (
                    <p>あなた独自の目標に合わせたカスタムプログラムを設定します。目標の詳細を入力してください。</p>
                  )}
                </div>
              </div>
              
              {/* 送信ボタン */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "目標を保存"}
                </Button>
              </div>
            </Form>
          </RemixForm>
        </Card>
      </div>
    </Layout>
  );
}
