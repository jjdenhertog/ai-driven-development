import { TaskDetailsPage } from '@/features/Tasks/components/TaskDetailsPage'

export default function TaskPage({ params }: { readonly params: { id: string } }) {
    return <TaskDetailsPage taskId={params.id} />
}