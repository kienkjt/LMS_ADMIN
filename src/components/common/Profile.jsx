import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { userService } from "../../services/userService";
import { updateUser } from "../../store/authSlice";
import { toast } from "react-toastify";
import { getRoleDisplay } from "../../utils/constants";
import {
  extractValidationErrors,
  handleApiError,
} from "../../utils/errorHandler";
import {
  FiUser,
  FiLock,
  FiCamera,
  FiTrash2,
  FiSave,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [activeTab, setActiveTab] = useState("info");
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    phoneNumber: "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const isMountedRef = useRef(false);

  // Function to load profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.debug("[Profile] Starting data load...");
      console.debug("[Profile] User object:", user);
      console.debug(
        "[Profile] Token in localStorage:",
        localStorage.getItem("lms_access_token") ? "YES" : "NO",
      );
      const res = await userService.getProfile();
      console.debug("[Profile] API Response:", res.data);
      const profileData = res.data?.data || res.data;
      console.debug("[Profile] Setting profile state:", profileData);
      setProfile(profileData);
      dispatch(updateUser(profileData));
      console.debug("[Profile] Profile loaded successfully");
    } catch (err) {
      console.error("[Profile] Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi tải thông tin hồ sơ";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount - only once
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      console.debug("[Profile] Component mounted, calling loadProfile");
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        gender: profile.gender || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      if (!form.fullName.trim()) {
        setErrors({ fullName: "Vui lòng nhập họ tên" });
        return;
      }

      setUpdating(true);
      setErrors({});
      const res = await userService.updateProfile(form);
      const profileData = res.data?.data || res.data;
      setProfile(profileData);
      dispatch(updateUser(profileData));
      setEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      const validationErrors = extractValidationErrors(err);
      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        toast.error(handleApiError(err));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      toast.error(
        "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setUpdating(true);
      setPasswordErrors({});
      await userService.changePassword(passwordForm);
      toast.success("Đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      const validationErrors = extractValidationErrors(err);
      if (validationErrors) {
        setPasswordErrors(validationErrors);
      } else {
        toast.error(handleApiError(err));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUpdating(true);
      const res = await userService.uploadAvatar(file);
      const profileData = res.data?.data || res.data;
      setProfile(profileData);
      dispatch(updateUser(profileData));
      toast.success("Upload ảnh đại diện thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi upload ảnh");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ảnh đại diện?")) return;

    try {
      setUpdating(true);
      const res = await userService.deleteAvatar();
      const profileData = res.data?.data || res.data;
      setProfile(profileData);
      dispatch(updateUser(profileData));
      toast.success("Xóa ảnh đại diện thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa ảnh");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div
        className="profile-page"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <div className="spinner spinner-lg"></div>
        <p style={{ marginTop: "16px" }}>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="profile-page"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <p>Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }

  if (!profile && !loading && !error) {
    return (
      <div
        className="profile-page"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <p>
          Không có dữ liệu hồ sơ.{" "}
          <button className="btn btn-primary btn-sm" onClick={loadProfile}>
            Tải lại
          </button>
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div
        className="profile-page"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <div
          style={{
            color: "var(--error)",
            marginBottom: "16px",
            fontSize: "18px",
          }}
        >
          ⚠️ Lỗi: {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setLoading(true);
            setError(null);
            loadProfile();
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: "user" },
    { id: "security", label: "Bảo mật", icon: "lock" },
  ];

  const getTabIcon = (iconName) => {
    switch (iconName) {
      case "user":
        return <FiUser size={18} />;
      case "lock":
        return <FiLock size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.fullName} />
              ) : (
                <span style={{ fontSize: "40px" }}>
                  {profile?.fullName?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <label
              className="avatar-edit-btn"
              title="Thay đổi ảnh đại diện"
              style={{ cursor: "pointer" }}
            >
              <FiCamera size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
                disabled={updating}
              />
            </label>
            {profile?.avatar && (
              <button
                className="avatar-edit-btn"
                title="Xóa ảnh đại diện"
                onClick={handleDeleteAvatar}
                style={{ cursor: "pointer", right: "40px" }}
                disabled={updating}
              >
                <FiTrash2 size={20} />
              </button>
            )}
          </div>
          <div className="profile-name-section">
            <h1>{profile?.fullName || "Tài khoản"}</h1>
            <p className="profile-role">{getRoleDisplay(user?.role)}</p>
            <p className="profile-email">{profile?.email || user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {getTabIcon(tab.icon)}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "info" && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h3>Thông tin cá nhân</h3>
              {!editing ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditing(true)}
                  disabled={updating}
                >
                  ✏️ Chỉnh sửa
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditing(false)}
                    disabled={updating}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveProfile}
                    disabled={updating}
                  >
                    {updating ? (
                      <span>Đang lưu...</span>
                    ) : (
                      <>
                        <FiSave size={16} />
                        <span>Lưu</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Họ và tên <span>*</span>
                  </label>
                  {editing ? (
                    <input
                      className="form-input"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className="profile-field-value">
                      {profile?.fullName || "—"}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  {editing ? (
                    <select
                      className="form-input"
                      value={form.gender || ""}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  ) : (
                    <div className="profile-field-value">
                      {profile?.gender === "MALE"
                        ? "Nam"
                        : profile?.gender === "FEMALE"
                          ? "Nữ"
                          : profile?.gender === "OTHER"
                            ? "Khác"
                            : "—"}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="profile-field-value">
                    {profile?.email || "—"}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  {editing ? (
                    <>
                      <input
                        className={`form-input ${errors.phoneNumber ? "input-error" : ""}`}
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => {
                          setForm({ ...form, phoneNumber: e.target.value });
                          if (errors.phoneNumber)
                            setErrors({ ...errors, phoneNumber: "" });
                        }}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phoneNumber && (
                        <span className="error-message">
                          {errors.phoneNumber}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="profile-field-value">
                      {profile?.phoneNumber || "—"}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: "8px" }}>
                <label className="form-label">Giới thiệu bản thân</label>
                {editing ? (
                  <textarea
                    className="form-textarea"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                    rows={4}
                  />
                ) : (
                  <div
                    className="profile-field-value"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {profile?.bio || "Chưa có thông tin giới thiệu"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h3>Đổi mật khẩu</h3>
            </div>
            <div className="card-body">
              <form
                onSubmit={handlePasswordChange}
                style={{ maxWidth: "480px" }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu hiện tại <span>*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      className={`form-input has-icon-right ${passwordErrors.currentPassword ? "input-error" : ""}`}
                      value={passwordForm.currentPassword}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        });
                        if (passwordErrors.currentPassword)
                          setPasswordErrors({
                            ...passwordErrors,
                            currentPassword: "",
                          });
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      tabIndex={-1}
                    >
                      {showPassword.current ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu mới <span>*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      className={`form-input has-icon-right ${passwordErrors.newPassword ? "input-error" : ""}`}
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        });
                        if (passwordErrors.newPassword)
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: "",
                          });
                      }}
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      tabIndex={-1}
                    >
                      {showPassword.new ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="error-message">
                      {passwordErrors.newPassword}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Xác nhận mật khẩu mới <span>*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      className={`form-input has-icon-right ${passwordErrors.confirmNewPassword ? "input-error" : ""}`}
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          confirmNewPassword: e.target.value,
                        });
                        if (passwordErrors.confirmNewPassword)
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmNewPassword: "",
                          });
                      }}
                      placeholder="Xác nhận mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      tabIndex={-1}
                    >
                      {showPassword.confirm ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmNewPassword && (
                    <span className="error-message">
                      {passwordErrors.confirmNewPassword}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "⏳ Đang cập nhật..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
