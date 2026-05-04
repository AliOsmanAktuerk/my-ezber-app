import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUp, CheckCircle2, Circle, ListChecks, Pencil, Plus, RefreshCw, Save, Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createCourseItem,
  type Course,
  type CourseItem,
  getCourseItems,
  getCourses,
  updateCourseItem,
} from '../api';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

const columnHelper = createColumnHelper<CourseItem>();
const emptyItemForm = {
  name: '',
  state: false,
  kursId: '',
};

export function CourseItemsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<CourseItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseItem | null>(null);

  async function loadItems(nextFilter = courseFilter) {
    setLoading(true);
    setError('');

    try {
      const selectedCourseId = nextFilter ? Number(nextFilter) : undefined;
      const [nextItems, nextCourses] = await Promise.all([getCourseItems(token, selectedCourseId), getCourses(token)]);
      setItems(nextItems);
      setCourses(nextCourses);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [token]);

  function courseName(kursId: number) {
    return courses.find((course) => course.id === kursId)?.name ?? `#${kursId}`;
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setFormError('');
    setItemForm(emptyItemForm);
    setEditingItem(null);
  }

  function openCreateModal() {
    setEditingItem(null);
    setItemForm({
      name: '',
      state: false,
      kursId: courseFilter || (courses[0]?.id ? String(courses[0].id) : ''),
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(item: CourseItem) {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      state: item.state,
      kursId: String(item.kursId),
    });
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const payload = {
      name: itemForm.name.trim(),
      state: itemForm.state,
      kursId: Number(itemForm.kursId),
    };

    if (!payload.name || !payload.kursId) {
      setFormError(t('courseItemRequiredFields'));
      return;
    }

    setSaving(true);

    try {
      if (editingItem) {
        await updateCourseItem(token, editingItem.id, payload);
      } else {
        await createCourseItem(token, payload);
      }

      setIsModalOpen(false);
      setItemForm(emptyItemForm);
      setEditingItem(null);
      await loadItems();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('courseItemId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: t('courseItemName'),
        cell: (info) => <span className="font-semibold text-slate-950">{info.getValue()}</span>,
      }),
      columnHelper.accessor('kursId', {
        header: t('courses'),
        cell: (info) => (
          <span className="inline-flex items-center gap-2 text-slate-700">
            <ListChecks size={16} aria-hidden="true" />
            {courseName(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('state', {
        header: t('courseItemState'),
        cell: (info) => {
          const isActive = info.getValue();
          const Icon = isActive ? CheckCircle2 : Circle;

          return (
            <span className={isActive ? 'status-pill status-public' : 'status-pill status-private'}>
              <Icon size={15} aria-hidden="true" />
              {isActive ? t('active') : t('inactive')}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <button className="btn-icon" type="button" onClick={() => openEditModal(info.row.original)} aria-label={t('editCourseItem')}>
            <Pencil size={17} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [t, courses],
  );

  const table = useReactTable({
    data: items,
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
          <p className="text-sm font-semibold text-emerald-700">{t('courseItems')}</p>
          <h2 className="mt-1 text-2xl font-bold">{t('courseItemOverview')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('courseItemOverviewIntro')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} aria-hidden="true" />
            {t('createCourseItem')}
          </button>
          <button className="btn-secondary" type="button" onClick={() => loadItems()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('courseItems')}</p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('active')}</p>
          <p className="mt-2 text-3xl font-bold">{items.filter((item) => item.state).length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('courses')}</p>
          <p className="mt-2 text-3xl font-bold">{courses.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[minmax(220px,360px)_220px_auto] lg:items-center">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              className="m-0 pl-10"
              type="search"
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={t('searchCourseItems')}
              aria-label={t('searchCourseItems')}
            />
          </label>
          <select
            className="m-0"
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value);
              void loadItems(event.target.value);
            }}
            aria-label={t('filterByCourse')}
          >
            <option value="">{t('allCourses')}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500 lg:text-right">
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
                      {t('loadingCourseItems')}
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
                      {t('noCourseItems')}
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
                <p className="text-sm font-semibold text-emerald-700">{t('courseItems')}</p>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingItem ? t('editCourseItem') : t('createCourseItem')}
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

            <form className="space-y-4 p-5" onSubmit={handleSaveItem}>
              {formError ? (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</div>
              ) : null}

              <label className="field">
                {t('courseItemName')}
                <input
                  value={itemForm.name}
                  onChange={(event) => setItemForm((current) => ({ ...current, name: event.target.value }))}
                  maxLength={255}
                  required
                />
              </label>

              <label className="field">
                {t('courses')}
                <select
                  value={itemForm.kursId}
                  onChange={(event) => setItemForm((current) => ({ ...current, kursId: event.target.value }))}
                  required
                >
                  <option value="">{t('selectCourse')}</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                <input
                  className="m-0 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-100"
                  type="checkbox"
                  checked={itemForm.state}
                  onChange={(event) => setItemForm((current) => ({ ...current, state: event.target.checked }))}
                />
                {t('markCourseItemActive')}
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button className="btn-secondary" type="button" onClick={closeModal} disabled={saving}>
                  {t('cancel')}
                </button>
                <button className="btn-primary" type="submit" disabled={saving}>
                  <Save size={18} aria-hidden="true" />
                  {saving ? t('saving') : editingItem ? t('updateCourseItem') : t('saveCourseItem')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
