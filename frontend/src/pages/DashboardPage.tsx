import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { boardsApi }   from '../api/boards.api';
import { dashboardApi } from '../api/dashboard.api';
import Navbar from '../components/ui/Navbar';
import type { CreateProjectDto, Project } from '../types';

export default function DashboardPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [showModal,    setShowModal]    = useState(false);
  const [editProject,  setEditProject]  = useState<Project | null>(null);
  const [showBoard,    setShowBoard]    = useState<number | null>(null);
  const [form, setForm] = useState<CreateProjectDto>(
    { name: '', description: '', color: '#6C63FF' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  projectsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.getStats,
  });

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', showBoard],
    queryFn:  () => boardsApi.getByProject(showBoard!),
    enabled:  !!showBoard,
  });

  const createProject = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async (data) => {
      await boardsApi.create(data.id, form.name + ' Board');
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6C63FF' });
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateProjectDto }) =>
      projectsApi.update(id, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      setEditProject(null);
      setForm({ name: '', description: '', color: '#6C63FF' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditProject(project);
    setForm({
      name:        project.name,
      description: project.description ?? '',
      color:       project.color
    });
  };

  const handleDeleteProject = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return;
    deleteProject.mutate(id);
  };

  const handleSaveProject = () => {
    if (!form.name.trim()) return;
    if (editProject) {
      updateProject.mutate({ id: editProject.id, dto: form });
    } else {
      createProject.mutate(form);
    }
  };

  const goToBoard = (boardId: number) =>
    navigate(`/board/${boardId}`);

  const COLORS = [
    '#6C63FF','#FF6584','#43D9AD',
    '#F9C74F','#38BDF8','#A78BFA','#FB923C'
  ];

  const StatCard = ({ label, value, color, icon }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4
                    flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                       text-2xl`}
           style={{ background: color + '22' }}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase
                      tracking-wider">
          {label}
        </p>
        <p className="text-white text-2xl font-bold font-mono">
          {value ?? 0}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">

        {/* Estadísticas */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-gray-400 text-sm font-semibold uppercase
                           tracking-wider mb-3">
              Resumen General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7
                            gap-3">
              <StatCard label="Total"      value={stats.totalTasks}
                icon="📋" color="#6C63FF" />
              <StatCard label="Pendientes" value={stats.pendingTasks}
                icon="⏳" color="#F9C74F" />
              <StatCard label="En Progreso" value={stats.inProgressTasks}
                icon="🔄" color="#38BDF8" />
              <StatCard label="En Revisión" value={stats.inReviewTasks}
                icon="👁" color="#A78BFA" />
              <StatCard label="Completadas" value={stats.completedTasks}
                icon="✅" color="#43D9AD" />
              <StatCard label="Vencidas"   value={stats.overdueTasks}
                icon="⚠️" color="#FF6584" />
              <StatCard label="Alta Prior." value={stats.highPriority}
                icon="🔴" color="#FB923C" />
            </div>

            {/* Productividad por usuario */}
            {stats.productivityByUser?.length > 0 && (
              <div className="mt-4 bg-gray-900 border border-gray-800
                              rounded-xl p-4">
                <h4 className="text-white font-semibold text-sm mb-3">
                  👥 Productividad por Usuario
                </h4>
                <div className="space-y-2">
                  {stats.productivityByUser.map((u: any) => {
                    const pct = u.total > 0
                      ? Math.round((u.completed / u.total) * 100) : 0;
                    return (
                      <div key={u.userCode}
                           className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-800
                                        flex items-center justify-center
                                        text-white text-xs font-bold
                                        flex-shrink-0">
{((u.fullName || u.userCode || '?').charAt(0)).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center
                                          justify-between mb-1">
                            <span className="text-white text-xs
                                             font-medium truncate">
                              {u.fullName || u.userCode}
                            </span>
                            <span className="text-gray-400 text-xs
                                             flex-shrink-0 ml-2">
                              {u.completed}/{u.total} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full
                                          overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full
                                         transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        {u.overdue > 0 && (
                          <span className="text-red-400 text-xs
                                           flex-shrink-0">
                            ⚠️ {u.overdue}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header Proyectos */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Mis Proyectos</h2>
            <p className="text-gray-400 text-sm mt-1">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setEditProject(null);
              setForm({ name: '', description: '', color: '#6C63FF' });
              setShowModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white
                       font-semibold rounded-lg px-4 py-2 text-sm
                       transition-colors"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {/* Grid Proyectos */}
        {isLoading ? (
          <div className="text-center text-gray-500 py-20">
            Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl
                          p-16 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-white font-semibold text-lg mb-2">
              No tienes proyectos aún
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Crea tu primer proyecto para empezar
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white
                         rounded-lg px-6 py-2.5 font-semibold
                         transition-colors"
            >
              + Crear Proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-3 gap-4">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                onClick={() => setShowBoard(project.id)}
                className="bg-gray-900 border border-gray-800 rounded-xl
                           p-5 hover:border-gray-600 transition-all
                           cursor-pointer group relative"
              >
                {/* Acciones */}
                <div className="absolute top-3 right-3 flex gap-1
                                opacity-0 group-hover:opacity-100
                                transition-opacity">
                  <button
                    onClick={e => handleEditProject(e, project)}
                    className="w-7 h-7 bg-gray-800 hover:bg-gray-700
                               border border-gray-700 rounded-lg
                               text-gray-400 hover:text-white text-xs
                               flex items-center justify-center
                               transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={e => handleDeleteProject(e, project.id)}
                    className="w-7 h-7 bg-gray-800 hover:bg-red-900/50
                               border border-gray-700 hover:border-red-700
                               rounded-lg text-gray-400 hover:text-red-400
                               text-xs flex items-center justify-center
                               transition-colors"
                  >
                    🗑
                  </button>
                </div>

                <div className="w-full h-1.5 rounded-full mb-4"
                     style={{ background: project.color }} />

                <h3 className="text-white font-semibold
                               group-hover:text-indigo-400
                               transition-colors pr-16">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-gray-400 text-sm mt-1 mb-3
                                line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between
                                text-xs text-gray-500 mt-3">
                  <span>👤 {project.owner}</span>
                  <span className={`px-2 py-0.5 rounded-full
                    ${project.status === 'ACTIVE'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-800 text-gray-400'}`}>
                    {project.status === 'ACTIVE' ? 'Activo' : project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Boards */}
        {showBoard && boards.length > 0 && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm
                          z-50 flex items-center justify-center p-4"
               onClick={() => setShowBoard(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl
                            p-6 w-full max-w-md"
                 onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">
                  Selecciona un Tablero
                </h3>
                <button onClick={() => setShowBoard(null)}
                  className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2">
                {boards.map((board: any) => (
                  <button
                    key={board.id}
                    onClick={() => goToBoard(board.id)}
                    className="w-full text-left bg-gray-800 hover:bg-gray-700
                               border border-gray-700 hover:border-indigo-500
                               rounded-lg px-4 py-3 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">
                        {board.name}
                      </p>
                      <span className="text-gray-600
                                       group-hover:text-indigo-400">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Crear/Editar Proyecto */}
      {(showModal || editProject) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm
                        z-50 flex items-center justify-center p-4"
             onClick={() => {
               setShowModal(false);
               setEditProject(null);
             }}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl
                          p-6 w-full max-w-md"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">
                {editProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditProject(null);
                }}
                className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold
                                  text-gray-400 uppercase
                                  tracking-wider mb-2">
                  Nombre *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-indigo-500"
                  placeholder="Nombre del proyecto"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold
                                  text-gray-400 uppercase
                                  tracking-wider mb-2">
                  Descripción
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-indigo-500
                             resize-none"
                  rows={3}
                  placeholder="Descripción opcional"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold
                                  text-gray-400 uppercase
                                  tracking-wider mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm({...form, color})}
                      className={`w-8 h-8 rounded-full transition-transform
                        ${form.color === color
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                          : 'hover:scale-110'}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditProject(null);
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700
                           text-gray-300 rounded-lg py-2.5 text-sm
                           font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!form.name ||
                  createProject.isPending ||
                  updateProject.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500
                           disabled:opacity-50 text-white rounded-lg
                           py-2.5 text-sm font-semibold
                           transition-colors flex items-center
                           justify-center gap-2"
              >
                {(createProject.isPending || updateProject.isPending) ? (
                  <>
                    <svg className="animate-spin h-4 w-4"
                         viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12"
                              r="10" stroke="currentColor"
                              strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  editProject ? 'Guardar cambios' : 'Crear Proyecto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}