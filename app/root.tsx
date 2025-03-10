import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { 
  QueryClient, 
  QueryClientProvider 
} from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "5ゾーン有酸素トレーニング" },
    { name: "description", content: "5ゾーン理論に基づいた有酸素トレーニングアプリケーション" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "/favicon.ico",
    type: "image/x-icon",
  },
];

export const loader = async () => {
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
};

// 基本のHTML構造を提供するコンポーネント - フックを使わない
function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// アプリのメインコンポーネント - フックを使用
export default function App() {
  const data = useLoaderData<typeof loader>();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Document>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </Document>
  );
}

// エラー境界コンポーネント - フックを使わない
export function ErrorBoundary() {
  return (
    <Document>
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="mb-4">アプリケーションでエラーが発生しました。</p>
          <a href="/" className="text-blue-600 dark:text-blue-400 underline">
            ホームに戻る
          </a>
        </div>
      </div>
    </Document>
  );
}
