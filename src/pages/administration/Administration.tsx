import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Administration() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Les fonctionnalités d&apos;administration sont indisponibles pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Administration;
