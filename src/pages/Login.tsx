import { useState } from 'react';
import apiClient from '@/lib/axios'; 
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react'; 

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data.data;

      localStorage.setItem('pos_auth_token', token);
      localStorage.setItem('pos_user', JSON.stringify(user));

      console.log("Login Berhasil:", user);
 
      alert(`Login Berhasil! Halo, ${user.name}`); 

    } catch (err: any) {
      console.log("🔥 ERROR FULL:", err);
      console.log("🔥 ERROR RESPONSE:", err.response);
      console.log("🔥 ERROR MESSAGE:", err.response?.data?.message);

      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">Arjuna POS</CardTitle>
          <CardDescription>Masuk untuk mengelola penjualan</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Alert Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="kasir@toko.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-slate-400">Versi 1.1.0 (Mock Mode)</p>
        </CardFooter>
      </Card>
    </div>
  );
}