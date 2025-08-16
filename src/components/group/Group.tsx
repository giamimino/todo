
type Task = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  group: { title: string } | null 
}

type Props = {
  title: string,
  tasks: Task[]
}

export default function GroupSide(props: Props) {
  return (
    <main>
      
    </main>
  )
}