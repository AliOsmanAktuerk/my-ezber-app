import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUp, DoorOpen, Pencil, Plus, RefreshCw, Save, Search, UserRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoom, getRooms, type Room, updateRoom } from '../api';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

const columnHelper = createColumnHelper<Room>();
const emptyRoomForm = {
  description: '',
};

export function RoomsPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  async function loadRooms() {
    setLoading(true);
    setError('');

    try {
      setRooms(await getRooms(token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRooms();
  }, [token]);

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setFormError('');
    setRoomForm(emptyRoomForm);
    setEditingRoom(null);
  }

  function openCreateModal() {
    setEditingRoom(null);
    setRoomForm(emptyRoomForm);
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(room: Room) {
    setEditingRoom(room);
    setRoomForm({
      description: room.description,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSaveRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const payload = {
      ownerId: editingRoom?.ownerId ?? user?.id ?? 0,
      description: roomForm.description.trim(),
    };

    if (!payload.ownerId || !payload.description) {
      setFormError(!payload.ownerId ? t('currentAccountMissing') : t('roomRequiredFields'));
      return;
    }

    setSaving(true);

    try {
      if (editingRoom) {
        await updateRoom(token, editingRoom.id, payload);
      } else {
        await createRoom(token, payload);
      }

      setIsModalOpen(false);
      setRoomForm(emptyRoomForm);
      setEditingRoom(null);
      await loadRooms();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('roomId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: t('roomDescription'),
        cell: (info) => <span className="font-semibold text-slate-950">{info.getValue()}</span>,
      }),
      columnHelper.accessor('ownerEmail', {
        header: t('roomOwner'),
        cell: (info) => (
          <span className="inline-flex items-center gap-2 text-slate-700">
            <UserRound size={16} aria-hidden="true" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('ownerId', {
        header: t('ownerId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <button className="btn-icon" type="button" onClick={() => openEditModal(info.row.original)} aria-label={t('editRoom')}>
            <Pencil size={17} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: rooms,
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
          <p className="text-sm font-semibold text-emerald-700">{t('rooms')}</p>
          <h2 className="mt-1 text-2xl font-bold">{t('roomOverview')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('roomOverviewIntro')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} aria-hidden="true" />
            {t('createRoom')}
          </button>
          <button className="btn-secondary" type="button" onClick={loadRooms} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('rooms')}</p>
          <p className="mt-2 text-3xl font-bold">{rooms.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('roomOwners')}</p>
          <p className="mt-2 text-3xl font-bold">{new Set(rooms.map((room) => room.ownerId)).size}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('myRooms')}</p>
          <p className="mt-2 text-3xl font-bold">{rooms.filter((room) => room.ownerId === user?.id).length}</p>
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
              placeholder={t('searchRooms')}
              aria-label={t('searchRooms')}
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
                      {t('loadingRooms')}
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
                      {t('noRooms')}
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
                <p className="text-sm font-semibold text-emerald-700">{t('rooms')}</p>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingRoom ? t('editRoom') : t('createRoom')}
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

            <form className="space-y-4 p-5" onSubmit={handleSaveRoom}>
              {formError ? (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</div>
              ) : null}

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">{t('roomOwner')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {editingRoom?.ownerEmail ?? user?.email ?? t('currentAccountMissing')}
                </p>
              </div>

              <label className="field">
                {t('roomDescription')}
                <textarea
                  value={roomForm.description}
                  onChange={(event) => setRoomForm((current) => ({ ...current, description: event.target.value }))}
                  maxLength={255}
                  rows={4}
                  required
                />
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button className="btn-secondary" type="button" onClick={closeModal} disabled={saving}>
                  {t('cancel')}
                </button>
                <button className="btn-primary" type="submit" disabled={saving}>
                  <Save size={18} aria-hidden="true" />
                  {saving ? t('saving') : editingRoom ? t('updateRoom') : t('saveRoom')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
