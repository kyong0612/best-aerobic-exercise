import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * E2Eテスト用のデータベースシード処理
 * 
 * このファイルは、E2Eテスト実行前にデータベースにテストユーザーを作成するために使用します。
 * テスト環境では実行前にDBをリセットし、このスクリプトを使って初期データを投入します。
 */
async function seedTestDatabase() {
  const prisma = new PrismaClient();

  try {
    // データベースをクリーンアップ
    await prisma.trainingGoal.deleteMany({});
    await prisma.user.deleteMany({});

    // テストユーザーを作成
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'テストユーザー',
      },
    });

    console.log(`テストユーザーを作成しました: ${testUser.email}`);

    return { success: true, message: 'テストデータの作成が完了しました' };
  } catch (error) {
    console.error('テストデータの作成に失敗しました:', error);
    return { success: false, message: '処理中にエラーが発生しました', error };
  } finally {
    await prisma.$disconnect();
  }
}

// このファイルが直接実行された場合にのみ実行
if (require.main === module) {
  seedTestDatabase()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('予期せぬエラーが発生しました:', error);
      process.exit(1);
    });
}

export { seedTestDatabase };
