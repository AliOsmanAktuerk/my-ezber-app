import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUp, KeyRound, Mail, Pencil, Plus, RefreshCw, Save, Search, ShieldCheck, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createAccount, getAccounts, getRoles, type Account, type Role, updateAccount } from '../api';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

const columnHelper = createColumnHelper<Account>();
const emptyUserForm = {
  email: '',
  password: '',
  rolleId: '',
};

export function UsersPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const [nextAccounts, nextRoles] = await Promise.all([getAccounts(token), getRoles(token)]);
      setAccounts(nextAccounts);
      setRoles(nextRoles);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [token]);

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setFormError('');
    setUserForm(emptyUserForm);
    setEditingAccount(null);
  }

  function openCreateModal() {
    setEditingAccount(null);
    setUserForm({
      email: '',
      password: '',
      rolleId: roles[0]?.id ? String(roles[0].id) : '',
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(account: Account) {
    setEditingAccount(account);
    setUserForm({
      email: account.email,
      password: '',
      rolleId: String(account.rolleId),
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSaveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const payload = {
      email: userForm.email.trim().toLowerCase(),
      password: userForm.password,
      rolleId: Number(userForm.rolleId),
    };

    if (!payload.email || !payload.password || !payload.rolleId) {
      setFormError(t('userRequiredFields'));
      return;
    }

    if (payload.password.length < 8) {
      setFormError(t('passwordTooShort'));
      return;
    }

    setSaving(true);

    try {
      if (editingAccount) {
        await updateAccount(token, editingAccount.id, payload);
      } else {
        await createAccount(token, payload);
      }

      setIsModalOpen(false);
      setUserForm(emptyUserForm);
      setEditingAccount(null);
      await loadUsers();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('userId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: t('name'),
        cell: (info) => <span className="font-semibold text-slate-950">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: t('email'),
        cell: (info) => (
          <span className="inline-flex items-center gap-2 text-slate-700">
            <Mail size={16} aria-hidden="true" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('rolleName', {
        header: t('roles'),
        cell: (info) => (
          <span className="status-pill status-private">
            <ShieldCheck size={15} aria-hidden="true" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('hash', {
        header: t('accountHash'),
        cell: (info) => <span className="block max-w-56 truncate font-mono text-xs text-slate-500">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <button className="btn-icon" type="button" onClick={() => openEditModal(info.row.original)} aria-label={t('editUser')}>
            <Pencil size={17} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: accounts,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{t('users')}</p>
          <h2 className="mt-1 text-2xl font-bold">{t('userOverview')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('userOverviewIntro')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} aria-hidden="true" />
            {t('createUser')}
          </button>
          <button className="btn-secondary" type="button" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('users')}</p>
          <p className="mt-2 text-3xl font-bold">{accounts.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('roles')}</p>
          <p className="mt-2 text-3xl font-bold">{roles.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('signedIn')}</p>
          <p className="mt-2 truncate text-lg font-bold">{user?.email}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              className="m-0 pl-10"
              type="search"
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={t('searchUsers')}
              aria-label={t('searchUsers')}
            />
          </label>
          <p className="text-sm text-slate-500">
            {table.getFilteredRowModel().rows.length} {t('results')}
          </p>
        </div>

        {error ? (
          <div className="p-6 text-sm font-medium text-red-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowDownUp size={14} aria-hidden="true" />
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                      {t('loadingUsers')}
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="max-w-md px-4 py-4 align-top text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                      {t('noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{t('users')}</p>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingAccount ? t('editUser') : t('createUser')}
                </h3>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                onClick={closeModal}
                aria-label={t('close')}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form className="space-y-4 p-5" onSubmit={handleSaveUser}>
              {formError ? (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</div>
              ) : null}

              <label className="field">
                {t('email')}
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>

              <label className="field">
                {editingAccount ? t('newPassword') : t('password')}
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                  minLength={8}
                  required
                />
              </label>

              <label className="field">
                {t('roles')}
                <select
                  value={userForm.rolleId}
                  onChange={(event) => setUserForm((current) => ({ ...current, rolleId: event.target.value }))}
                  required
                >
                  <option value="">{t('selectRole')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button className="btn-secondary" type="button" onClick={closeModal} disabled={saving}>
                  {t('cancel')}
                </button>
                <button className="btn-primary" type="submit" disabled={saving}>
                  <Save size={18} aria-hidden="true" />
                  {saving ? t('saving') : editingAccount ? t('updateUser') : t('saveUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
