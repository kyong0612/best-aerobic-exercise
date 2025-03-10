import { test, expect } from '@playwright/test';

/**
 * トレーニング目標設定画面のE2Eテスト
 * 
 * テスト方法:
 * 1. `/goals/new` にアクセス
 * 2. 各フィールドに値を入力
 * 3. 「目標を保存」ボタンをクリック
 * 4. ダッシュボードに目標が表示されることを確認
 */
test.describe('トレーニング目標設定機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理が必要な場合は実装
    // 例: await loginUser(page, 'testuser@example.com', 'password');
    
    // テスト用のログイン処理を簡易化（実際の環境に合わせて調整が必要）
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ダッシュボードにリダイレクトされたことを確認
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('デフォルトの目標タイプ（ダイエット・脂肪燃焼）で目標を作成できる', async ({ page }) => {
    // 1. 目標設定ページにアクセス
    await page.goto('/goals/new');
    await expect(page).toHaveTitle(/.*トレーニング目標の設定.*/);

    // 2. 各フィールドに値を入力（デフォルトの目標タイプはダイエット・脂肪燃焼）
    // 開始日（今日の日付がデフォルトで設定される）
    // 目標達成予定日を1ヶ月後に設定
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const targetDate = nextMonth.toISOString().split('T')[0];
    await page.fill('input[name="targetDate"]', targetDate);

    // 3. 「目標を保存」ボタンをクリック
    await page.click('button:has-text("目標を保存")');

    // 4. ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. ダッシュボードに目標が表示されていることを確認
    await expect(page.locator('text=ダイエット・脂肪燃焼')).toBeVisible();
  });

  test('カスタム目標を作成できる', async ({ page }) => {
    // 1. 目標設定ページにアクセス
    await page.goto('/goals/new');

    // 2. 各フィールドに値を入力
    // カスタム目標を選択
    await page.selectOption('select[name="type"]', 'custom');
    
    // カスタム目標の詳細を入力
    const customDescription = '週3回のHIITトレーニングと週2回のヨガを組み合わせた独自プログラム';
    await page.fill('textarea[name="customDescription"]', customDescription);
    
    // 開始日と目標達成予定日を設定
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    const targetDate = threeMonthsLater.toISOString().split('T')[0];
    await page.fill('input[name="targetDate"]', targetDate);

    // 3. 「目標を保存」ボタンをクリック
    await page.click('button:has-text("目標を保存")');

    // 4. ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. ダッシュボードにカスタム目標が表示されていることを確認
    await expect(page.locator('text=カスタム目標')).toBeVisible();
    await expect(page.locator(`text=${customDescription}`)).toBeVisible();
  });

  test('カスタム目標の詳細が不足している場合はエラーが表示される', async ({ page }) => {
    // 1. 目標設定ページにアクセス
    await page.goto('/goals/new');

    // 2. カスタム目標を選択するが詳細を入力しない
    await page.selectOption('select[name="type"]', 'custom');
    
    // 3. 「目標を保存」ボタンをクリック
    await page.click('button:has-text("目標を保存")');

    // 4. エラーメッセージが表示されることを確認
    await expect(page.locator('text=カスタム目標の詳細は必須です')).toBeVisible();
    
    // ページ遷移していないことを確認
    await expect(page).toHaveURL(/.*goals\/new/);
  });
});
