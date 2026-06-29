import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CourseCardProps = {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="h-full border-slate-200 bg-white/85">
      <CardHeader>
        <div className="mb-4 flex items-center justify-between">
          <Badge>Course</Badge>
          <span className="text-sm font-medium text-slate-500">₹{course.price.toLocaleString()}</span>
        </div>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={`/courses/${course.id}`}>
          <Button variant="outline" className="w-full">
            View course
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
