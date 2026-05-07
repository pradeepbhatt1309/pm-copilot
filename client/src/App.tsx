import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import HistoryPage from "./pages/HistoryPage";
import StakeholdersPage from "./pages/StakeholdersPage";
import ProjectsPage from "./pages/ProjectsPage";
import TemplatesPage from "./pages/TemplatesPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={MainPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/stakeholders" component={StakeholdersPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/templates" component={TemplatesPage} />
        <Route path="/settings" component={SettingsPage} />
      </Switch>
    </Layout>
  );
}
