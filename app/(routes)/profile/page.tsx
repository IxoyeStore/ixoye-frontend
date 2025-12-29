import { Button } from "@/components/ui/button";

const PageProfile = () => {
    return ( 
        <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p><strong>Nombre:</strong> Usuario demo</p>
        <p><strong>Email:</strong> usuario@email.com</p>

        <Button variant="outline">
          Cerrar sesión
        </Button>
      </div>
    </div>
     );
}
 
export default PageProfile;