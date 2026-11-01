import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import AccountHeader from "./component/AccountHeader"
import AccountDepartmentKPI from "./component/AccountDepartmentKPI"
import AccountFilters from "./component/AccountFilters"
import AccountTable from "./component/AccountTable"
import AccountPagination from "./component/AccountPagination"
import ConfirmDialog from "./component/ConfirmDialog"
import {
    getStoredAccounts,
    saveStoredAccounts,
    getDepartmentKPIStats,
} from "./mockAccountsData"
import styles from "./index.module.scss"

const PAGE_SIZE = 10

function Accounts() {
    const navigate = useNavigate()
    const location = useLocation()

    // 1. Quản lý danh sách tài khoản (đọc từ localStorage để đồng bộ với màn hình Tạo mới)
    const [accounts, setAccounts] = useState(() => getStoredAccounts())

    // Khi quay lại từ trang khác (hoặc vừa tạo xong), làm mới danh sách
    useEffect(() => {
        setAccounts(getStoredAccounts())
        if (location.state?.toastMessage) {
            showToast(location.state.toastMessage, location.state.toastType || "success")
            // Xóa state để không hiện lại khi refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    // 2. Bộ lọc & Tìm kiếm
    const [searchTerm, setSearchTerm] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")

    // 3. Phân trang (mặc định 10 acc/trang)
    const [currentPage, setCurrentPage] = useState(1)

    // 4. Trạng thái Confirm Dialog (chỉ dùng cho xác nhận Khóa / Mở khóa)
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: "LOCK",
        account: null,
    })

    // 5. Toast Thông báo
    const [toast, setToast] = useState(null)

    const showToast = (message, type = "success") => {
        setToast({ message, type })
        setTimeout(() => {
            setToast(null)
        }, 3800)
    }

    // Thống kê KPI cập nhật theo thời gian thực
    const kpiStats = useMemo(() => {
        return getDepartmentKPIStats(accounts)
    }, [accounts])

    // Lọc và tìm kiếm danh sách tài khoản
    const filteredAccounts = useMemo(() => {
        return accounts.filter((acc) => {
            // Tìm kiếm theo tên, mã, email, sđt, vị trí
            if (searchTerm.trim()) {
                const query = searchTerm.toLowerCase().trim()
                const matchName = acc.fullName?.toLowerCase().includes(query)
                const matchCode = acc.code?.toLowerCase().includes(query)
                const matchEmail = acc.email?.toLowerCase().includes(query)
                const matchPhone = acc.phone?.toLowerCase().includes(query)
                const matchPosition = acc.position?.toLowerCase().includes(query)
                if (!matchName && !matchCode && !matchEmail && !matchPhone && !matchPosition) {
                    return false
                }
            }

            // Lọc theo ban
            if (departmentFilter !== "ALL" && acc.departmentId !== departmentFilter) {
                return false
            }

            // Lọc theo trạng thái
            if (statusFilter !== "ALL" && acc.status !== statusFilter) {
                return false
            }

            return true
        })
    }, [accounts, searchTerm, departmentFilter, statusFilter])

    // Cắt danh sách theo phân trang (cố định 10 acc/trang)
    const paginatedAccounts = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE
        return filteredAccounts.slice(startIndex, startIndex + PAGE_SIZE)
    }, [filteredAccounts, currentPage])

    // Reset về trang 1 khi thay đổi bộ lọc
    const handleSearchChange = (val) => {
        setSearchTerm(val)
        setCurrentPage(1)
    }

    const handleDepartmentChange = (deptId) => {
        setDepartmentFilter(deptId)
        setCurrentPage(1)
    }

    const handleStatusChange = (status) => {
        setStatusFilter(status)
        setCurrentPage(1)
    }

    const handleResetFilters = () => {
        setSearchTerm("")
        setDepartmentFilter("ALL")
        setStatusFilter("ALL")
        setCurrentPage(1)
    }

    // === CÁC THAO TÁC ĐIỀU HƯỚNG & NGHIỆP VỤ ===

    // Chuyển sang màn hình Thêm tài khoản mới (làm sau)
    const handleNavigateToCreate = () => {
        navigate(ROUTER.SCHOOL_ACCOUNT_CREATE || "/school/administration/accounts/create")
    }

    // Chuyển sang màn hình Cập nhật tài khoản (làm sau)
    const handleNavigateToEdit = (account) => {
        const editUrl = ROUTER.SCHOOL_ACCOUNT_EDIT
            ? ROUTER.SCHOOL_ACCOUNT_EDIT.replace(":id", account.id)
            : `/school/administration/accounts/${account.id}/edit`
        navigate(editUrl)
    }

    // Khóa / Mở khóa tài khoản (chuyển đổi 2 trạng thái lock/unlock)
    const handlePromptToggleStatus = (account) => {
        const isLocked = account.status === "LOCKED"
        setConfirmDialog({
            isOpen: true,
            type: isLocked ? "UNLOCK" : "LOCK",
            account,
        })
    }

    // Xác nhận Khóa / Mở khóa từ ConfirmDialog
    const handleConfirmToggleStatus = (account, type) => {
        let updated
        if (type === "LOCK") {
            updated = accounts.map((acc) =>
                acc.id === account.id ? { ...acc, status: "LOCKED" } : acc
            )
            setAccounts(updated)
            saveStoredAccounts(updated)
            showToast(`Đã tạm khóa tài khoản "${account.fullName}" (${account.code})!`, "warning")
        } else if (type === "UNLOCK") {
            updated = accounts.map((acc) =>
                acc.id === account.id ? { ...acc, status: "ACTIVE" } : acc
            )
            setAccounts(updated)
            saveStoredAccounts(updated)
            showToast(`Đã mở khóa tài khoản "${account.fullName}" thành công!`, "success")
        }
    }

    return (
        <div className={styles.accountsPageContainer}>
            {/* Toast thông báo nhanh */}
            {toast && (
                <div className={`${styles.toastNotification} ${styles[`toast_${toast.type}`]}`}>
                    {toast.type === "success" && <CheckCircle2 size={18} className={styles.toastIcon} />}
                    {toast.type === "warning" && <AlertCircle size={18} className={styles.toastIcon} />}
                    {toast.type === "info" && <Info size={18} className={styles.toastIcon} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* 1. Header trên cùng: Tiêu đề + Giới thiệu + Nút Thêm tài khoản */}
            <AccountHeader
                onCreateAccount={handleNavigateToCreate}
                totalAccounts={accounts.length}
            />

            {/* 2. Thống kê số lượng account của 6 ban */}
            <AccountDepartmentKPI
                stats={kpiStats}
                selectedDepartment={departmentFilter}
                onSelectDepartment={handleDepartmentChange}
            />

            {/* 3. Tìm kiếm theo tên & Lọc theo ban */}
            <AccountFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                departmentFilter={departmentFilter}
                onDepartmentChange={handleDepartmentChange}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                onResetFilters={handleResetFilters}
                totalResults={filteredAccounts.length}
            />

            {/* 4. Bảng danh sách tài khoản:
          Cột: Mã, Họ tên, Phòng ban, Trạng thái, Hành động (CHỈ 2 NÚT: Cập nhật & Khóa/Mở khóa) */}
            <AccountTable
                accounts={paginatedAccounts}
                onNavigateToEdit={handleNavigateToEdit}
                onToggleStatus={handlePromptToggleStatus}
            />

            {/* 5. Phân trang dưới cùng (Mặc định 10 acc / trang) */}
            <AccountPagination
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredAccounts.length}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* Dialog Xác nhận Khóa / Mở khóa tài khoản */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                type={confirmDialog.type}
                account={confirmDialog.account}
                onClose={() =>
                    setConfirmDialog({ isOpen: false, type: "LOCK", account: null })
                }
                onConfirm={handleConfirmToggleStatus}
            />
        </div>
    )
}

export default Accounts
