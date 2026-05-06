import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUp, ArrowLeft, BookOpen, DoorOpen, Eye, MailPlus, RefreshCw, Save, Search, UsersRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { getClassroomAccounts, getClassrooms, inviteClassroomAccount, type Classroom, type ClassroomAccount } from '../api';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

const columnHelper = createColumnHelper<Classroom>();

export function ClassroomsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomAccounts, setClassroomAccounts] = useState<ClassroomAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [savingInvite, setSavingInvite] = useState(false);

  async function loadClassrooms() {
    setLoading(true);
    setError('');

    try {
      setClassrooms(await getClassrooms(token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClassrooms();
  }, [token]);

  async function openClassroomDetail(classroom: Classroom) {
    setSelectedClassroom(classroom);
    setClassroomAccounts([]);
    setAccountsError('');
    setAccountsLoading(true);

    try {
      setClassroomAccounts(await getClassroomAccounts(token, classroom.id));
    } catch (requestError) {
      setAccountsError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setAccountsLoading(false);
    }
  }

  function closeClassroomDetail() {
    setSelectedClassroom(null);
    setClassroomAccounts([]);
    setAccountsError('');
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteError('');
  }

  function statusLabel(status: Classroom['status']) {
    return status === 'JOINED' ? t('joinedStatus') : t('invitedStatus');
  }

  function statusClass(status: Classroom['status']) {
    return status === 'JOINED' ? 'status-pill status-public' : 'status-pill status-private';
  }

  function openInviteModal() {
    setInviteEmail('');
    setInviteError('');
    setIsInviteModalOpen(true);
  }

  function closeInviteModal() {
    if (savingInvite) {
      return;
    }

    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteError('');
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteError('');

    if (!selectedClassroom || !inviteEmail.trim()) {
      setInviteError(t('inviteRequiredFields'));
      return;
    }

    setSavingInvite(true);

    try {
      await inviteClassroomAccount(token, selectedClassroom.id, { email: inviteEmail.trim().toLowerCase() });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setClassroomAccounts(await getClassroomAccounts(token, selectedClassroom.id));
    } catch (requestError) {
      setInviteError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSavingInvite(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('classroomId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('roomDescription', {
        header: t('rooms'),
        cell: (info) => (
          <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
            <DoorOpen size={16} aria-hidden="true" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('kursName', {
        header: t('courses'),
        cell: (info) => (
          <span className="inline-flex items-center gap-2 text-slate-700">
            <BookOpen size={16} aria-hidden="true" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('accountEmail', {
        header: t('roomOwner'),
        cell: (info) => (
          <span className="block">
            <span className="block font-semibold text-slate-950">{info.row.original.accountName}</span>
            <span className="block text-xs text-slate-500">{info.getValue()}</span>
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <button className="btn-icon" type="button" onClick={() => openClassroomDetail(info.row.original)} aria-label={t('viewClassroom')}>
            <Eye size={17} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: classrooms,
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

  if (selectedClassroom) {
    return (
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <button className="btn-secondary mb-4" type="button" onClick={closeClassroomDetail}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t('backToClassrooms')}
            </button>
            <p className="text-sm font-semibold text-emerald-700">{t('classroomDetail')}</p>
            <h2 className="mt-1 text-2xl font-bold">{selectedClassroom.roomDescription}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{selectedClassroom.kursName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={openInviteModal}>
              <MailPlus size={18} aria-hidden="true" />
              {t('inviteUser')}
            </button>
            <button className="btn-secondary" type="button" onClick={() => openClassroomDetail(selectedClassroom)} disabled={accountsLoading}>
              <RefreshCw className={accountsLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
              {t('refresh')}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t('classroomAccounts')}</p>
            <p className="mt-2 text-3xl font-bold">{classroomAccounts.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t('rooms')}</p>
            <p className="mt-2 truncate text-lg font-bold">{selectedClassroom.roomDescription}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t('courses')}</p>
            <p className="mt-2 truncate text-lg font-bold">{selectedClassroom.kursName}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4">
            <UsersRound size={18} aria-hidden="true" className="text-emerald-700" />
            <h3 className="font-bold text-slate-950">{t('classroomAccounts')}</h3>
          </div>

          {accountsError ? (
            <div className="p-6 text-sm font-medium text-red-700">{accountsError}</div>
          ) : accountsLoading ? (
            <div className="p-6 text-sm text-slate-500">{t('loadingClassroomAccounts')}</div>
          ) : classroomAccounts.length ? (
            <div className="divide-y divide-slate-100">
              {classroomAccounts.map((account) => (
                <div key={`${account.id}-${account.email}`} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-950">{account.name}</p>
                    <p className="text-sm text-slate-500">{account.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusClass(account.status)}>{statusLabel(account.status)}</span>
                    <span className="font-mono text-xs text-slate-500">#{account.id}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-500">{t('noClassroomAccounts')}</div>
          )}
        </div>

        {isInviteModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">{t('classroomAccounts')}</p>
                  <h3 className="text-lg font-bold text-slate-950">{t('inviteUser')}</h3>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeInviteModal}
                  aria-label={t('close')}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <form className="space-y-4 p-5" onSubmit={handleInvite}>
                {inviteError ? (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{inviteError}</div>
                ) : null}

                <label className="field">
                  {t('email')}
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    required
                  />
                </label>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button className="btn-secondary" type="button" onClick={closeInviteModal} disabled={savingInvite}>
                    {t('cancel')}
                  </button>
                  <button className="btn-primary" type="submit" disabled={savingInvite}>
                    <Save size={18} aria-hidden="true" />
                    {savingInvite ? t('saving') : t('sendInvite')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{t('classrooms')}</p>
          <h2 className="mt-1 text-2xl font-bold">{t('classroomOverview')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('classroomOverviewIntro')}</p>
        </div>

        <button className="btn-secondary" type="button" onClick={loadClassrooms} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          {t('refresh')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('classrooms')}</p>
          <p className="mt-2 text-3xl font-bold">{classrooms.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('rooms')}</p>
          <p className="mt-2 text-3xl font-bold">{new Set(classrooms.map((classroom) => classroom.roomId)).size}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('courses')}</p>
          <p className="mt-2 text-3xl font-bold">{new Set(classrooms.map((classroom) => classroom.kursId)).size}</p>
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
              placeholder={t('searchClassrooms')}
              aria-label={t('searchClassrooms')}
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
                      {t('loadingClassrooms')}
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
                      {t('noClassrooms')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
