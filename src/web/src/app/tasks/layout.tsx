import { TasksLayout } from '@/features/Tasks/components/TasksLayout'

export default function Layout({ children }: { readonly children: React.ReactNode }) {
    return <TasksLayout>{children}</TasksLayout>
}