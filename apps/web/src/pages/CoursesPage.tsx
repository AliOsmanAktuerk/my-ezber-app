import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownUp, ArrowLeft, CheckCircle2, Circle, Globe2, ListChecks, LockKeyhole, Pencil, Plus, RefreshCw, Save, Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createCourse, createCourseItem, type Course, type CourseItem, getCourseItems, getCourses, updateCourse, updateCourseItem } from '../api';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

const columnHelper = createColumnHelper<Course>();
const itemColumnHelper = createColumnHelper<CourseItem>();
const emptyCourseForm = {
  name: '',
  description: '',
  publicCourse: false,
};
const emptyItemForm = {
  name: '',
  state: false,
};

export function CoursesPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [createError, setCreateError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [itemSorting, setItemSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [itemFormError, setItemFormError] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseItem | null>(null);

  async function loadCourses() {
    setLoading(true);
    setError('');

    try {
      setCourses(await getCourses(token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function loadCourseItems(courseId: number) {
    setItemsLoading(true);
    setItemsError('');

    try {
      setItems(await getCourseItems(token, courseId));
    } catch (requestError) {
      setItemsError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, [token]);

  function closeCreateModal() {
    if (saving) {
      return;
    }

    setIsCreateOpen(false);
    setCreateError('');
    setCourseForm(emptyCourseForm);
    setEditingCourse(null);
  }

  function openCreateModal() {
    setEditingCourse(null);
    setCourseForm(emptyCourseForm);
    setCreateError('');
    setIsCreateOpen(true);
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description,
      publicCourse: course.publicCourse,
    });
    setCreateError('');
    setIsCreateOpen(true);
  }

  async function handleSaveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError('');

    const payload = {
      name: courseForm.name.trim(),
      description: courseForm.description.trim(),
      publicCourse: courseForm.publicCourse,
    };

    if (!payload.name || !payload.description) {
      setCreateError(t('courseRequiredFields'));
      return;
    }

    setSaving(true);

    try {
      if (editingCourse) {
        await updateCourse(token, editingCourse.id, payload);
      } else {
        await createCourse(token, payload);
      }

      setIsCreateOpen(false);
      setCourseForm(emptyCourseForm);
      setEditingCourse(null);
      await loadCourses();
      if (selectedCourse) {
        setSelectedCourse({ ...selectedCourse, ...payload });
      }
    } catch (requestError) {
      setCreateError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSaving(false);
    }
  }

  function openCourseDetail(course: Course) {
    setSelectedCourse(course);
    setItemFilter('');
    void loadCourseItems(course.id);
  }

  function closeCourseDetail() {
    setSelectedCourse(null);
    setItems([]);
    setItemsError('');
    setItemFilter('');
    setEditingItem(null);
    setIsItemModalOpen(false);
  }

  function closeItemModal() {
    if (savingItem) {
      return;
    }

    setIsItemModalOpen(false);
    setItemFormError('');
    setItemForm(emptyItemForm);
    setEditingItem(null);
  }

  function openCreateItemModal() {
    setEditingItem(null);
    setItemForm(emptyItemForm);
    setItemFormError('');
    setIsItemModalOpen(true);
  }

  function openEditItemModal(item: CourseItem) {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      state: item.state,
    });
    setItemFormError('');
    setIsItemModalOpen(true);
  }

  async function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setItemFormError('');

    if (!selectedCourse) {
      setItemFormError(t('selectCourse'));
      return;
    }

    const payload = {
      name: itemForm.name.trim(),
      state: itemForm.state,
      kursId: selectedCourse.id,
    };

    if (!payload.name) {
      setItemFormError(t('courseItemRequiredFields'));
      return;
    }

    setSavingItem(true);

    try {
      if (editingItem) {
        await updateCourseItem(token, editingItem.id, payload);
      } else {
        await createCourseItem(token, payload);
      }

      setIsItemModalOpen(false);
      setItemForm(emptyItemForm);
      setEditingItem(null);
      await loadCourseItems(selectedCourse.id);
    } catch (requestError) {
      setItemFormError(requestError instanceof Error ? requestError.message : t('genericError'));
    } finally {
      setSavingItem(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('courseId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: t('courseName'),
        cell: (info) => <span className="font-semibold text-slate-950">{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: t('courseDescription'),
        cell: (info) => <span className="line-clamp-2 text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('publicCourse', {
        header: t('courseVisibility'),
        cell: (info) => {
          const isPublic = info.getValue();
          const Icon = isPublic ? Globe2 : LockKeyhole;

          return (
            <span className={isPublic ? 'status-pill status-public' : 'status-pill status-private'}>
              <Icon size={15} aria-hidden="true" />
              {isPublic ? t('publicCourse') : t('privateCourse')}
            </span>
          );
        },
      }),
      columnHelper.accessor('accountEmail', {
        header: t('courseOwner'),
        cell: (info) => {
          const course = info.row.original;

          return (
            <span className="block">
              <span className="block font-semibold text-slate-950">{course.accountName}</span>
              <span className="block text-xs text-slate-500">{info.getValue()}</span>
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => {
          const course = info.row.original;

          return (
            <div className="flex items-center gap-2">
              <button className="btn-icon" type="button" onClick={() => openCourseDetail(course)} aria-label={t('courseItems')}>
                <ListChecks size={17} aria-hidden="true" />
              </button>
              <button className="btn-icon" type="button" onClick={() => openEditModal(course)} aria-label={t('editCourse')}>
                <Pencil size={17} aria-hidden="true" />
              </button>
            </div>
          );
        },
      }),
    ],
    [t],
  );

  const itemColumns = useMemo(
    () => [
      itemColumnHelper.accessor('id', {
        header: t('courseItemId'),
        cell: (info) => <span className="font-mono text-sm text-slate-600">#{info.getValue()}</span>,
      }),
      itemColumnHelper.accessor('name', {
        header: t('courseItemName'),
        cell: (info) => <span className="font-semibold text-slate-950">{info.getValue()}</span>,
      }),
      itemColumnHelper.accessor('state', {
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
      itemColumnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <button className="btn-icon" type="button" onClick={() => openEditItemModal(info.row.original)} aria-label={t('editCourseItem')}>
            <Pencil size={17} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: courses,
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

  const itemTable = useReactTable({
    data: items,
    columns: itemColumns,
    state: {
      globalFilter: itemFilter,
      sorting: itemSorting,
    },
    onGlobalFilterChange: setItemFilter,
    onSortingChange: setItemSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (selectedCourse) {
    return (
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <button className="btn-secondary mb-4" type="button" onClick={closeCourseDetail}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t('backToCourses')}
            </button>
            <p className="text-sm font-semibold text-emerald-700">{t('courseDetail')}</p>
            <h2 className="mt-1 text-2xl font-bold">{selectedCourse.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{selectedCourse.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={openCreateItemModal}>
              <Plus size={18} aria-hidden="true" />
              {t('createCourseItem')}
            </button>
            <button className="btn-secondary" type="button" onClick={() => loadCourseItems(selectedCourse.id)} disabled={itemsLoading}>
              <RefreshCw className={itemsLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
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
            <p className="text-sm text-slate-500">{t('courseVisibility')}</p>
            <p className="mt-2 text-lg font-bold">{selectedCourse.publicCourse ? t('publicCourse') : t('privateCourse')}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t('courseOwner')}</p>
            <p className="mt-2 truncate text-lg font-bold">{selectedCourse.accountName}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{selectedCourse.accountEmail}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input
                className="m-0 pl-10"
                type="search"
                value={itemFilter}
                onChange={(event) => setItemFilter(event.target.value)}
                placeholder={t('searchCourseItems')}
                aria-label={t('searchCourseItems')}
              />
            </label>
            <p className="text-sm text-slate-500">
              {itemTable.getFilteredRowModel().rows.length} {t('results')}
            </p>
          </div>

          {itemsError ? (
            <div className="p-6 text-sm font-medium text-red-700">{itemsError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  {itemTable.getHeaderGroups().map((headerGroup) => (
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
                  {itemsLoading ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={itemColumns.length}>
                        {t('loadingCourseItems')}
                      </td>
                    </tr>
                  ) : itemTable.getRowModel().rows.length ? (
                    itemTable.getRowModel().rows.map((row) => (
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
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={itemColumns.length}>
                        {t('noCourseItems')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isItemModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">{selectedCourse.name}</p>
                  <h3 className="text-lg font-bold text-slate-950">
                    {editingItem ? t('editCourseItem') : t('createCourseItem')}
                  </h3>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeItemModal}
                  aria-label={t('close')}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <form className="space-y-4 p-5" onSubmit={handleSaveItem}>
                {itemFormError ? (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{itemFormError}</div>
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
                  <button className="btn-secondary" type="button" onClick={closeItemModal} disabled={savingItem}>
                    {t('cancel')}
                  </button>
                  <button className="btn-primary" type="submit" disabled={savingItem}>
                    <Save size={18} aria-hidden="true" />
                    {savingItem ? t('saving') : editingItem ? t('updateCourseItem') : t('saveCourseItem')}
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
          <p className="text-sm font-semibold text-emerald-700">{t('courses')}</p>
          <h2 className="mt-1 text-2xl font-bold">{t('courseOverview')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('courseOverviewIntro')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" type="button" onClick={openCreateModal}>
            <Plus size={18} aria-hidden="true" />
            {t('createCourse')}
          </button>
          <button className="btn-secondary" type="button" onClick={loadCourses} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('courses')}</p>
          <p className="mt-2 text-3xl font-bold">{courses.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('publicCourse')}</p>
          <p className="mt-2 text-3xl font-bold">{courses.filter((course) => course.publicCourse).length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t('privateCourse')}</p>
          <p className="mt-2 text-3xl font-bold">{courses.filter((course) => !course.publicCourse).length}</p>
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
              placeholder={t('searchCourses')}
              aria-label={t('searchCourses')}
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
                      {t('loadingCourses')}
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
                      {t('noCourses')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{t('courses')}</p>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingCourse ? t('editCourse') : t('createCourse')}
                </h3>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                onClick={closeCreateModal}
                aria-label={t('close')}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form className="space-y-4 p-5" onSubmit={handleSaveCourse}>
              {createError ? (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{createError}</div>
              ) : null}

              <label className="field">
                {t('courseName')}
                <input
                  value={courseForm.name}
                  onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))}
                  maxLength={255}
                  required
                />
              </label>

              <label className="field">
                {t('courseDescription')}
                <textarea
                  value={courseForm.description}
                  onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                  maxLength={255}
                  rows={4}
                  required
                />
              </label>

              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                <input
                  className="m-0 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-100"
                  type="checkbox"
                  checked={courseForm.publicCourse}
                  onChange={(event) => setCourseForm((current) => ({ ...current, publicCourse: event.target.checked }))}
                />
                {t('markCoursePublic')}
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button className="btn-secondary" type="button" onClick={closeCreateModal} disabled={saving}>
                  {t('cancel')}
                </button>
                <button className="btn-primary" type="submit" disabled={saving}>
                  <Save size={18} aria-hidden="true" />
                  {saving ? t('saving') : editingCourse ? t('updateCourse') : t('saveCourse')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
