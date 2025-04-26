import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGenerator from '../components/ImageGenerator';
import { getProject } from '../services/projects';

export default function DesignGeneratorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // טעינת פרטי הפרויקט
    const loadProject = async () => {
      if (!projectId) {
        setError('Project ID is missing');
        setLoading(false);
        return;
      }

      try {
        const projectData = await getProject(projectId);
        if (!projectData) {
          setError('Project not found');
        } else {
          setProject(projectData);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleImageGenerated = (imageUrl: string) => {
    // הוספת התמונה החדשה לרשימת התמונות שנוצרו
    setGeneratedImages(prev => [...prev, imageUrl]);
  };

  const handleViewProject = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Design Generator</h1>
          {projectId && (
            <button 
              onClick={handleViewProject}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Project
            </button>
          )}
        </div>

        {project && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {projectId && (
              <ImageGenerator 
                projectId={projectId} 
                onImageGenerated={handleImageGenerated} 
              />
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Generated Designs</h2>
              
              {generatedImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No designs generated yet</p>
                  <p className="text-sm mt-2">Upload an image and create your first design</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Generated design ${index + 1}`} 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {project && project.designs && project.designs.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Project Designs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {project.designs.map((design: any, index: number) => (
                <div key={index} className="relative group">
                  <img 
                    src={design.url} 
                    alt={`Design ${index + 1}`} 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 