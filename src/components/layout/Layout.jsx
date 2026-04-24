import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { TopBar } from "./TopBar";

export function Layout({ title, subtitle, children }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-y-auto p-6 terminal-scroll">{children}</main>
        </div>
      </div>
    </div>
  );
}
