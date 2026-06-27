import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import useProject from "../hooks/useProject";
import ProjectTitleModal from "./ProjectTitleModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import LogoutModal from "./LogoutModal";
import styles from "../styles/layout.module.css";

/**
 * AppLayout — Global wrapper shared by /dashboard and /project.
 * Houses the fixed brand anchor, hamburger toggle, slide-out sidebar drawer,
 * and the backdrop overlay. Wires live auth + project state with NO logic changes.
 */
const AppLayout = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { _id, title }
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Live auth bindings (untouched hook)
  const { user, handleLogout, handleLogoutFromAll } = useAuth();

  // Live project bindings (untouched hook)
  const { allProjects, setTitle, handleDeleteProject, handleGetAllProjects } = useProject();

  useEffect(() => {
    handleGetAllProjects();
  }, []);

  const closeNav = () => setIsNavOpen(false);

  // Open the title modal instead of navigating immediately
  const handleNewProject = () => {
    closeNav();
    setIsModalOpen(true);
  };

  // Called by modal on confirm — set title then go to dashboard
  const handleModalConfirm = (enteredTitle) => {
    setTitle(enteredTitle);
    navigate("/dashboard");
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project?id=${projectId}`);
    closeNav();
  };

  const openLogoutModal = () => {
    closeNav();
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async (scope) => {
    setIsLogoutModalOpen(false);
    if (scope === "all") {
      await handleLogoutFromAll();
    } else {
      await handleLogout();
    }
    navigate("/login");
  };

  return (
    <div className={styles.root}>
      {/* Fixed Top-Left Brand Anchor */}
      <div className={styles.brandAnchor}>
        <div
          className={styles.brandLogo}
          onClick={() => navigate("/dashboard")}
        >
          GETWEB
        </div>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label={isNavOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined">
            {isNavOpen ? "close" : "menu_open"}
          </span>
        </button>
      </div>

      {/* ── Backdrop Blur Overlay ────────────────────────────────── */}
      <div
        className={`${styles.backdrop} ${isNavOpen ? styles.backdropVisible : styles.backdropHidden}`}
        onClick={closeNav}
      />

      {/* ── Slide-Out Drawer Sidebar ─────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${isNavOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      >
        {/* 1. New Project Button */}
        <button className={styles.sidebarNewBtn} onClick={handleNewProject}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            add
          </span>
          New Project
        </button>

        {/* 2. Search Input */}
        {/**
        <div className={styles.sidebarSearchWrap}>
          <div className={styles.sidebarSearchRow}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "16px",
                color: "var(--color-on-surface-variant)",
                opacity: 0.7,
              }}
            >
              search
            </span>
            <input
              className={styles.sidebarSearchInput}
              type="text"
              placeholder="Search projects..."
            />
          </div>
        </div> */}

        {/* 3. Recent Projects Label */}
        <div className={styles.sidebarLabel}>Recent Projects</div>

        {/* 4. Project List — live from allProjects state */}
        <div className={styles.sidebarProjectList}>
          {allProjects && allProjects.length > 0 ? (
            allProjects.map((project) => {
              const currentProjectId = searchParams.get("id");
              const isWorkspacePage = location.pathname === "/project";
              const isActive = isWorkspacePage && currentProjectId === project._id;

              return (
                <div
                  key={project._id}
                  className={`${styles.sidebarProjectItem} ${isActive ? styles.sidebarProjectItemActive : ""}`}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <span className={styles.sidebarProjectName}>
                    {project.title || "Untitled Project"}
                  </span>

                  <div className={styles.sidebarProjectItemRight}>
                    <div
                      className={
                        project.status === "generating"
                          ? styles.statusDotGenerating
                          : styles.statusDotCompleted
                      }
                    />
                    <button
                      className={styles.sidebarDeleteBtn}
                      title="Delete project"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ _id: project._id, title: project.title });
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "16px" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "12px",
                fontSize: "12px",
                color: "rgba(228,190,177,0.35)",
                fontFamily: "var(--font-body)",
              }}
            >
              No projects yet.
            </div>
          )}
        </div>

        {/* 5. Bottom Profile & Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.profileCard}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    person
                  </span>
                )}
              </div>
              <div>
                <div className={styles.profileName}>
                  {user?.name || "Guest User"}
                </div>
                <div className={styles.profilePlan}>Pro Plan</div>
              </div>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={openLogoutModal}
              title="Sign Out"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Slot ────────────────────────────────────── */}
      <div className={styles.contentSlot}>{children}</div>

      {/* ── New Project Title Modal ───────────────────────────────── */}
      <ProjectTitleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        mode="new"
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={!!pendingDelete}
        projectTitle={pendingDelete?.title}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) handleDeleteProject(pendingDelete._id);
          setPendingDelete(null);
        }}
      />

      {/* ── Logout Scope Modal ────────────────────────────────────── */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default AppLayout;
