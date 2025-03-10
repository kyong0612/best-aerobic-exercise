import { Link } from "@remix-run/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              5ゾーントレーニング
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              5ゾーン理論に基づいた効果的な有酸素トレーニングを実現するためのアプリケーション
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              リンク
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  サービスについて
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              ゾーン情報
            </h3>
            <ul className="mt-2 space-y-2">
              <li className="text-sm text-gray-500 dark:text-gray-400">
                ゾーン1: 最大心拍数の50〜60%
              </li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                ゾーン2: 最大心拍数の60〜70%
              </li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                ゾーン3: 最大心拍数の70〜80%
              </li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                ゾーン4: 最大心拍数の80〜90%
              </li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                ゾーン5: 最大心拍数の90〜100%
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} 5ゾーントレーニング. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
