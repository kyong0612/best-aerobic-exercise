import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// テスト終了後に自動的にクリーンアップ
afterEach(() => {
  cleanup();
});
