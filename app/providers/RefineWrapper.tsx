"use client";

import { Refine } from "@refinedev/core";
import { ConfigProvider, App } from "antd";
import routerBindings from "@refinedev/nextjs-router";
import { dataProvider } from "./data-provider";
import { authProvider } from "./auth-provider";
import DatabaseInitializer from "../lib/components/DatabaseInitializer";

export default function RefineWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
        },
      }}
    >
      <App>
        <DatabaseInitializer />
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          routerProvider={routerBindings}
          resources={[
            {
              name: "users",
              list: "/users",
              create: "/users/create",
              edit: "/users/edit/:id",
              show: "/users/show/:id",
            },
            {
              name: "books",
              list: "/books",
              create: "/books/create",
              edit: "/books/edit/:id",
              show: "/books/:id",
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            useNewQueryKeys: true,
            projectId: "management-books",
          }}
        >
          {children}
        </Refine>
      </App>
    </ConfigProvider>
  );
}


