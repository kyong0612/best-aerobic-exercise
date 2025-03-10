import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { zoneDescriptions } from "~/utils/heartRate";
import Button from "~/components/common/Button";
import Card from "~/components/common/Card";

export const meta: MetaFunction = () => {
  return [
    { title: "5ゾーン有酸素トレーニング" },
    { name: "description", content: "5ゾーン理論に基づいた効果的な有酸素トレーニングを実現するアプリケーション" },
  ];
};

export default function Index() {
  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            5ゾーン理論で<br className="md:hidden" />効果的な有酸素トレーニングを
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            あなたの目的に合わせた最適な心拍ゾーンのトレーニングプランを作成し、効率的に結果を出すためのアプリケーション
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/register">
              <Button size="lg">無料で始める</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">詳しく見る</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            5ゾーントレーニングの特徴
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                科学的根拠に基づいたトレーニング
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                最大心拍数を基準とした5つのゾーンで、効率的かつ効果的なトレーニングを実現します。
              </p>
            </Card>
            <Card variant="elevated" className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                パーソナライズされたプラン
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                あなたの目的（ダイエット、心肺機能向上、マラソン対策など）に合わせた最適なトレーニングプランを提供します。
              </p>
            </Card>
            <Card variant="elevated" className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                詳細な進捗管理
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                トレーニングの記録や分析を通じて、あなたの成長を可視化し、モチベーションを維持します。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5ゾーン説明セクション */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            5つの心拍ゾーンとは
          </h2>
          <div className="space-y-6">
            {Object.entries(zoneDescriptions)
              .filter(([key]) => key !== "0") // ゾーン0は除外
              .map(([key, zone]) => (
                <Card key={key} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div 
                      className={`p-6 md:w-1/3 flex flex-col justify-center items-center text-white ${
                        key === "1" ? "bg-blue-400" :
                        key === "2" ? "bg-green-500" :
                        key === "3" ? "bg-yellow-500" :
                        key === "4" ? "bg-orange-500" :
                        "bg-red-500"
                      }`}
                    >
                      <h3 className="text-2xl font-bold mb-2">ゾーン{key}</h3>
                      <p className="text-xl">{zone.name}</p>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <p className="mb-4 text-gray-700 dark:text-gray-300">{zone.description}</p>
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">効果:</h4>
                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                          {zone.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">例:</h4>
                        <p className="text-gray-700 dark:text-gray-300">{zone.examples.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-12 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            あなたにぴったりのトレーニングプランを作成しましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            無料で登録して、科学的に裏付けられた効果的なトレーニングを始めましょう。
          </p>
          <Link to="/auth/register">
            <Button variant="secondary" size="lg">今すぐ始める</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
