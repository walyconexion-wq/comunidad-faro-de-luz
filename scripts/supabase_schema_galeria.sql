-- SCRIPT SQL DE CREACIÓN Y HABILITACIÓN DE TABLA GALERIA_MULTIMEDIA EN SUPABASE
-- Copiar y pegar en el SQL Editor de Supabase (https://supabase.com/dashboard/project/osdduwjsicoaeojfhokm/sql)

CREATE TABLE IF NOT EXISTS public.galeria_multimedia (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'video')),
  categoria TEXT NOT NULL,
  url TEXT NOT NULL,
  descripcion TEXT,
  destacado BOOLEAN DEFAULT false,
  fecha TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.galeria_multimedia ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Total para la Web y el Búnker
DROP POLICY IF EXISTS "Permitir lectura publica galeria" ON public.galeria_multimedia;
CREATE POLICY "Permitir lectura publica galeria" ON public.galeria_multimedia FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica galeria" ON public.galeria_multimedia;
CREATE POLICY "Permitir insercion publica galeria" ON public.galeria_multimedia FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica galeria" ON public.galeria_multimedia;
CREATE POLICY "Permitir actualizacion publica galeria" ON public.galeria_multimedia FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica galeria" ON public.galeria_multimedia;
CREATE POLICY "Permitir eliminacion publica galeria" ON public.galeria_multimedia FOR DELETE USING (true);

-- Poblado Inicial con los 6 elementos oficiales
INSERT INTO public.galeria_multimedia (id, titulo, tipo, categoria, url, descripcion, destacado, fecha)
VALUES
  ('item-1', 'Emblema Oficial Faro de Luz 3D', 'foto', 'Montaña & Predio', 'https://farodeluz.dpdns.org/og-faro.jpg', 'Insignia dorada en relieve 3D sobre metal oscuro y haces de luz.', true, now()),
  ('item-2', 'Amanecer en las Altas Cumbres', 'foto', 'Montaña & Predio', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Vista panorámica de las sierras cordobesas donde se asienta la comunidad.', true, now()),
  ('item-3', 'Domo Geodésico y Búnker Central', 'foto', 'Domo & Obra', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80', 'Estructura geodésica central de frecuencia 4/5 para reuniones y telecomunicaciones.', true, now()),
  ('item-4', 'Microrred Solar Fotovoltaica 18.4kW', 'foto', 'Ecotecnología', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', 'Generación solar con banco de baterías de litio 48V para autonomía continua.', false, now()),
  ('item-5', 'Viviendas Modulares 40ft High Cube', 'foto', 'Domo & Obra', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 'Montaje sobre pilotes antisísmicos con aislamiento térmico de poliuretano proyectado.', false, now()),
  ('item-6', 'Recorrido Panorámico del Valle', 'video', 'Montaña & Predio', 'https://www.youtube.com/embed/ScMzIvxBSi4', 'Registro audiovisual de la geografía y entorno natural de Traslasierra.', true, now())
ON CONFLICT (id) DO NOTHING;
