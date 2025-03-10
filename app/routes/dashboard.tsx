import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId, getUser } from "../utils/auth.server";
import { prisma } from "../utils/db.server";
import Layout from "../components/layout/Layout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Link } from "@remix-run/react";
import { calculateAllHeartRateZones, determineHeartRateZone } from "../utils/heartRate";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ユーザーIDを取得、ログインしていなければログインページにリダイレクト
  const userId = await requireUserId(request);
  
  // ユーザー情報を取得
  const user = await getUser(request);
  if (!user) {
    throw new Error("ユーザー情報が見つかりません");
  }

  // 心拍ゾーン情報を取得
  const heartRateZones = await prisma.heartRateZones.findUnique({
    where: { userId },
  });

  // トレーニング目標を取得
  const trainingGoals = await prisma.trainingGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  // 最新のトレーニングプランを取得
  const trainingPlans = await prisma.trainingPlan.findMany({
    where: { 
      userId,
      isActive: true 
    },
    include: {
      workouts: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  // 最新のワークアウトログを取得
  const recentWorkoutLogs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
  });

  return json({
    user,
    heartRateZones,
    trainingGoal: trainingGoals[0] || null,
    trainingPlan: trainingPlans[0] || null,
    recentWorkoutLogs,
  });
};

export default function Dashboard() {
  const { user, heartRateZones, trainingGoal, trainingPlan, recentWorkoutLogs } = 
    useLoaderData<typeof loader>();

  // 心拍ゾーンの計算
  const zones = calculateAllHeartRateZones(user.maxHeartRate);

  // 現在の曜日を取得 (0: 日曜日, 1: 月曜日, ...)
  const today = new Date().getDay();

  // 今日のワークアウト予定を取得
  const todayWorkout = trainingPlan?.workouts.find(w => w.dayOfWeek === today);

  // 今週のゾーン滞在時間を集計
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // この週のログを抽出
  const thisWeekLogs = recentWorkoutLogs.filter(
    log => new Date(log.date) >= oneWeekAgo
  );

  // ゾーン別の合計時間を計算
  const weeklyZoneTotals = {
    zone1: thisWeekLogs.reduce((sum, log) => sum + (log.zone1Duration || 0), 0),
    zone2: thisWeekLogs.reduce((sum, log) => sum + (log.zone2Duration || 0), 0),
    zone3: thisWeekLogs.reduce((sum, log) => sum + (log.zone3Duration || 0), 0),
    zone4: thisWeekLogs.reduce((sum, log) => sum + (log.zone4Duration || 0), 0),
    zone5: thisWeekLogs.reduce((sum, log) => sum + (log.zone5Duration || 0), 0),
  };

  // 合計トレーニング時間
  const totalTrainingTime = 
    weeklyZoneTotals.zone1 + 
    weeklyZoneTotals.zone2 + 
    weeklyZoneTotals.zone3 + 
    weeklyZoneTotals.zone4 + 
    weeklyZoneTotals.zone5;

  // 曜日の日本語表記
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <Layout user={user}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* トレーニング目標 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">トレーニング目標</h2>
            {trainingGoal ? (
              <div>
                <p className="font-medium">
                  目標: {
                    trainingGoal.type === "weight_loss" ? "ダイエット・脂肪燃焼" :
                    trainingGoal.type === "cardio_health" ? "心肺機能向上" :
                    trainingGoal.type === "marathon" ? "マラソン・長距離レース対策" :
                    trainingGoal.type === "sprint" ? "短距離・スプリント能力向上" :
                    "カスタム目標"
                  }
                </p>
                {trainingGoal.customDescription && (
                  <p className="mt-2">{trainingGoal.customDescription}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  開始日: {new Date(trainingGoal.startDate).toLocaleDateString('ja-JP')}
                </p>
                {trainingGoal.targetDate && (
                  <p className="mt-1 text-sm text-gray-500">
                    目標日: {new Date(trainingGoal.targetDate).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-4">トレーニング目標が設定されていません。</p>
                <Link to="/goals/new">
                  <Button size="sm">目標を設定する</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* 心拍ゾーン */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">心拍ゾーン</h2>
            {heartRateZones ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">最大心拍数:</span>
                  <span>{user.maxHeartRate} bpm</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 px-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <span>ゾーン1:</span>
                    <span>{heartRateZones.zone1Min} - {heartRateZones.zone1Max} bpm</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-green-100 dark:bg-green-900/30 rounded">
                    <span>ゾーン2:</span>
                    <span>{heartRateZones.zone2Min} - {heartRateZones.zone2Max} bpm</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <span>ゾーン3:</span>
                    <span>{heartRateZones.zone3Min} - {heartRateZones.zone3Max} bpm</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                    <span>ゾーン4:</span>
                    <span>{heartRateZones.zone4Min} - {heartRateZones.zone4Max} bpm</span>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-red-100 dark:bg-red-900/30 rounded">
                    <span>ゾーン5:</span>
                    <span>{heartRateZones.zone5Min} - {heartRateZones.zone5Max} bpm</span>
                  </div>
                </div>
                <Link to="/profile" className="block text-sm text-blue-600 dark:text-blue-400 mt-3">
                  ゾーン設定を編集
                </Link>
              </div>
            ) : (
              <div>
                <p>心拍ゾーン情報が見つかりません。</p>
                <Link to="/profile" className="text-blue-600 dark:text-blue-400">
                  プロフィールを更新する
                </Link>
              </div>
            )}
          </Card>

          {/* 本日のワークアウト */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">本日のワークアウト</h2>
            {todayWorkout ? (
              <div>
                <h3 className="font-medium text-lg mb-2">{todayWorkout.name}</h3>
                <p className="mb-3">{todayWorkout.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-medium">運動タイプ: 
                    <span className="ml-2">
                      {todayWorkout.activityType === "run" ? "ランニング" :
                       todayWorkout.activityType === "walk" ? "ウォーキング" :
                       todayWorkout.activityType === "cycle" ? "サイクリング" :
                       todayWorkout.activityType === "swim" ? "スイミング" : 
                       "その他"}
                    </span>
                  </p>
                  <p className="text-sm">合計時間: {todayWorkout.duration}分</p>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-sm font-medium">ゾーン別時間配分:</p>
                  {todayWorkout.zone1Duration > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-blue-50 dark:bg-blue-900/20 text-sm rounded">
                      <span>ゾーン1:</span>
                      <span>{todayWorkout.zone1Duration}分</span>
                    </div>
                  )}
                  {todayWorkout.zone2Duration > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-green-50 dark:bg-green-900/20 text-sm rounded">
                      <span>ゾーン2:</span>
                      <span>{todayWorkout.zone2Duration}分</span>
                    </div>
                  )}
                  {todayWorkout.zone3Duration > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-yellow-50 dark:bg-yellow-900/20 text-sm rounded">
                      <span>ゾーン3:</span>
                      <span>{todayWorkout.zone3Duration}分</span>
                    </div>
                  )}
                  {todayWorkout.zone4Duration > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-orange-50 dark:bg-orange-900/20 text-sm rounded">
                      <span>ゾーン4:</span>
                      <span>{todayWorkout.zone4Duration}分</span>
                    </div>
                  )}
                  {todayWorkout.zone5Duration > 0 && (
                    <div className="flex justify-between items-center py-1 px-2 bg-red-50 dark:bg-red-900/20 text-sm rounded">
                      <span>ゾーン5:</span>
                      <span>{todayWorkout.zone5Duration}分</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link to={`/workouts/log?planned=${todayWorkout.id}`}>
                    <Button size="sm">ログを記録</Button>
                  </Link>
                  <Link to={`/plans/${trainingPlan.id}`}>
                    <Button size="sm" variant="outline">詳細を見る</Button>
                  </Link>
                </div>
              </div>
            ) : trainingPlan ? (
              <div>
                <p className="mb-4">本日（{weekdays[today]}曜日）のワークアウトは予定されていません。</p>
                <Link to={`/plans/${trainingPlan.id}`}>
                  <Button size="sm" variant="outline">プラン詳細を見る</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="mb-4">アクティブなトレーニングプランがありません。</p>
                <Link to="/plans/new">
                  <Button size="sm">プランを作成する</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* 週間サマリー */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">週間サマリー</h2>
            {thisWeekLogs.length > 0 ? (
              <div>
                <div className="mb-4">
                  <p className="font-medium">合計トレーニング時間: {totalTrainingTime}分</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    直近7日間のトレーニング記録
                  </p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium">ゾーン別時間配分:</h3>
                  {totalTrainingTime > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-400" 
                            style={{ width: `${(weeklyZoneTotals.zone1 / totalTrainingTime) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${(weeklyZoneTotals.zone2 / totalTrainingTime) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-yellow-500" 
                            style={{ width: `${(weeklyZoneTotals.zone3 / totalTrainingTime) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-orange-500" 
                            style={{ width: `${(weeklyZoneTotals.zone4 / totalTrainingTime) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${(weeklyZoneTotals.zone5 / totalTrainingTime) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-blue-400 mr-1 rounded-sm"></span> 
                            ゾーン1:
                          </span>
                          <span>{weeklyZoneTotals.zone1}分 ({Math.round((weeklyZoneTotals.zone1 / totalTrainingTime) * 100)}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-green-500 mr-1 rounded-sm"></span> 
                            ゾーン2:
                          </span>
                          <span>{weeklyZoneTotals.zone2}分 ({Math.round((weeklyZoneTotals.zone2 / totalTrainingTime) * 100)}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-yellow-500 mr-1 rounded-sm"></span> 
                            ゾーン3:
                          </span>
                          <span>{weeklyZoneTotals.zone3}分 ({Math.round((weeklyZoneTotals.zone3 / totalTrainingTime) * 100)}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-orange-500 mr-1 rounded-sm"></span> 
                            ゾーン4:
                          </span>
                          <span>{weeklyZoneTotals.zone4}分 ({Math.round((weeklyZoneTotals.zone4 / totalTrainingTime) * 100)}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-red-500 mr-1 rounded-sm"></span> 
                            ゾーン5:
                          </span>
                          <span>{weeklyZoneTotals.zone5}分 ({Math.round((weeklyZoneTotals.zone5 / totalTrainingTime) * 100)}%)</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">ゾーン時間データがありません</p>
                  )}
                </div>
                
                <Link to="/analytics">
                  <Button size="sm" variant="outline">詳細な分析を見る</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="mb-4">過去7日間のワークアウト記録がありません。</p>
                <Link to="/workouts/log">
                  <Button size="sm">ワークアウトを記録する</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* 最近のワークアウト履歴 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">最近のワークアウト</h2>
          
          {recentWorkoutLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">日付</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">タイプ</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">時間</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">平均心拍数</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">主要ゾーン</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">感想</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentWorkoutLogs.map((log) => {
                    // 最も時間を過ごしたゾーンを計算
                    const zoneTimes = [
                      log.zone1Duration || 0,
                      log.zone2Duration || 0,
                      log.zone3Duration || 0,
                      log.zone4Duration || 0,
                      log.zone5Duration || 0,
                    ];
                    const maxZoneIndex = zoneTimes.indexOf(Math.max(...zoneTimes));
                    const primaryZone = maxZoneIndex + 1;
                    
                    // 主要ゾーンの色を設定
                    const zoneColors = [
                      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                    ];
                    
                    // 平均心拍数からゾーンを計算
                    const avgHeartRateZone = log.avgHeartRate 
                      ? determineHeartRateZone(log.avgHeartRate, user.maxHeartRate)
                      : null;
                    
                    return (
                      <tr key={log.id}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.activityType === "run" ? "ランニング" :
                          log.activityType === "walk" ? "ウォーキング" :
                          log.activityType === "cycle" ? "サイクリング" :
                          log.activityType === "swim" ? "スイミング" : 
                          "その他"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.duration}分
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.avgHeartRate ? (
                            <span className="flex items-center">
                              {log.avgHeartRate} bpm
                              {avgHeartRateZone !== null && avgHeartRateZone > 0 && (
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${zoneColors[avgHeartRateZone - 1]}`}>
                                  Z{avgHeartRateZone}
                                </span>
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {zoneTimes.some(t => t > 0) ? (
                            <span className={`px-2 py-1 rounded-full text-xs ${zoneColors[primaryZone - 1]}`}>
                              ゾーン{primaryZone}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.feelingRating ? (
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <span key={rating} className={`text-sm ${
                                  rating <= log.feelingRating! 
                                    ? "text-yellow-500" 
                                    : "text-gray-300 dark:text-gray-600"
                                }`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <Link 
                            to={`/workouts/${log.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Card padding="md">
              <p className="text-center py-6">
                ワークアウト記録がありません。新しいワークアウトを記録してください。
              </p>
              <div className="flex justify-center">
                <Link to="/workouts/log">
                  <Button>ワークアウトを記録する</Button>
                </Link>
              </div>
            </Card>
          )}
          
          {recentWorkoutLogs.length > 0 && (
            <div className="mt-4 text-right">
              <Link to="/workouts" className="text-blue-600 dark:text-blue-400 hover:underline">
                すべての記録を見る →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
