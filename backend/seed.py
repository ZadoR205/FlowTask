import sys
from pathlib import Path

# Asegurar que el directorio backend esté en sys.path para imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal
from app.services.seed_service import SeedService


def run_seed():
    print("🌱 Iniciando proceso de reseteo y Seeding para FlowTask...")
    db = SessionLocal()
    try:
        result = SeedService.reset_and_seed_db(db)
        print(f"✅ {result['message']}")
        print(f"   - Usuarios: {result['users']}")
        print(f"   - Tableros/Categorías: {result['categories']}")
        print(f"   - Estados: {result['states']}")
        print(f"   - Tareas: {result['tasks']}")
    except Exception as e:
        print(f"❌ Error durante el seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
