import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getThemeClass } from '../lib/themes';

export default function NotFoundPage() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${getThemeClass('backgrounds', 'section')}`}>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Sorry, the page you are looking for does not exist.
          </p>
          <Button asChild className={`${getThemeClass('backgrounds', 'primary')} ${getThemeClass('backgrounds', 'primaryHover')}`}>
            <Link to="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
