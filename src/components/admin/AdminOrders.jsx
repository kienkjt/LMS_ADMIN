import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminOrderService } from '../../services/adminService';
import './Admin.css';

const STATUS_OPTIONS = ['', 'PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

const STATUS_LABEL = {
  PENDING: 'Ch? thanh toán',
  COMPLETED: 'Đ? thanh toán',
  CANCELLED: 'Đ? h?y',
  REFUNDED: 'Đ? hoàn ti?n',
};

const fmtDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const fmtMoney = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')} đ`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.list({ keyword, status, page, size });
      const pageData = res.data || {};
      setOrders(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không th? t?i danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [keyword, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const runRefund = async (order) => {
    const reason = window.prompt(`Nh?p l? do hoàn ti?n cho đơn ${order.orderCode || order.id}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('L? do không đư?c đ? tr?ng');
      return;
    }

    try {
      setActionLoading(order.id);
      await adminOrderService.refund(order.id, reason.trim());
      toast.success('Hoàn ti?n thành công');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không th? hoàn ti?n đơn hàng');
    } finally {
      setActionLoading('');
    }
  };

  const runCancel = async (order) => {
    const reason = window.prompt(`Nh?p l? do h?y đơn ${order.orderCode || order.id}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('L? do không đư?c đ? tr?ng');
      return;
    }

    try {
      setActionLoading(order.id);
      await adminOrderService.cancel(order.id, reason.trim());
      toast.success('H?y đơn thành công');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không th? h?y đơn hàng');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header">
        <h2>Qu?n l? đơn hàng</h2>
        <div style={{ color: 'var(--text-muted)' }}>T?ng: {totalElements}</div>
      </div>

      <div className="admin-filters" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <input
          className="input"
          placeholder="T?m theo m? đơn, tên ho?c email h?c viên"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
        />
        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'ALL'} value={s}>
              {s ? STATUS_LABEL[s] || s : 'T?t c? tr?ng thái'}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>M? đơn</th>
              <th>H?c viên</th>
              <th>T?ng ti?n</th>
              <th>Tr?ng thái</th>
              <th>Ngày t?o</th>
              <th>Hành đ?ng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Đang t?i...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Không có d? li?u</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderCode || order.id}</td>
                  <td>
                    <div>{order.studentName || '-'}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{order.studentEmail || '-'}</small>
                  </td>
                  <td>{fmtMoney(order.finalAmount || order.totalAmount)}</td>
                  <td>{STATUS_LABEL[order.status] || order.status || '-'}</td>
                  <td>{fmtDate(order.createdAt)}</td>
                  <td>
                    {order.status === 'PENDING' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => runCancel(order)}
                        disabled={actionLoading === order.id}
                      >
                        H?y
                      </button>
                    )}
                    {order.status === 'COMPLETED' && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => runRefund(order)}
                        disabled={actionLoading === order.id}
                      >
                        Hoàn ti?n
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination" style={{ marginTop: 16 }}>
        <button
          className="btn btn-outline btn-sm"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Trang trư?c
        </button>
        <span>Trang {page + 1} / {Math.max(1, totalPages)}</span>
        <button
          className="btn btn-outline btn-sm"
          disabled={page >= Math.max(0, totalPages - 1)}
          onClick={() => setPage((p) => Math.min(Math.max(0, totalPages - 1), p + 1))}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;

