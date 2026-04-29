import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/Login";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardPage } from "@/pages/Dashboard";
import { FieldReportPage } from "@/pages/FieldReport";
import styles from "./App.module.css";

const Placeholder = ({ name }: { name: string }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.placeholder}>
      <h2>{name}</h2>
      <p>{t("placeholder.desc")}</p>
    </div>
  );
};

function AppShell() {
  const { t } = useTranslation();
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.content}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/field-report" element={<FieldReportPage />} />
          <Route
            path="/camera"
            element={<Placeholder name={t("sidebar.nav.items.liveCamera")} />}
          />
          <Route
            path="/detections"
            element={<Placeholder name={t("sidebar.nav.items.detectionLog")} />}
          />
          <Route
            path="/passport"
            element={
              <Placeholder name={t("sidebar.nav.items.plantPassport")} />
            }
          />
          <Route
            path="/trends"
            element={
              <Placeholder name={t("sidebar.nav.items.severityTrends")} />
            }
          />
          <Route
            path="/treatments"
            element={
              <Placeholder name={t("sidebar.nav.items.recommendations")} />
            }
          />
          <Route
            path="/history"
            element={
              <Placeholder name={t("sidebar.nav.items.treatmentHistory")} />
            }
          />
          <Route
            path="/position"
            element={
              <Placeholder name={t("sidebar.nav.items.standPosition")} />
            }
          />
          <Route
            path="/alerts"
            element={
              <Placeholder name={t("sidebar.nav.items.notifications")} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
