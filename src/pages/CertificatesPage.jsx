import React from "react";
import { Link } from "react-router-dom";
import { FaCertificate } from "react-icons/fa";
import { ROUTES } from "../utils/constants";

const CertificatesPage = () => {
  return (
    <div className="animate-fade-in" style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <FaCertificate /> Chung chi cua toi
      </h1>
      <div
        style={{
          background: "var(--bg-primary)",
          border: "1px dashed var(--border-color)",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Tinh nang dang duoc cap nhat</h3>
        <p style={{ marginBottom: 16 }}>
          Chung chi se hien thi khi ban hoan thanh 100 phan tram khoa hoc.
        </p>
        <Link to={ROUTES.STUDENT_COURSES} className="btn btn-primary btn-sm">
          Di den khoa hoc cua toi
        </Link>
      </div>
    </div>
  );
};

export default CertificatesPage;
