package app.mythiccompanions.MythicCompanions.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        // Defineix la carpeta on es guardaran les imatges.
        // Paths.get("user-content") crea una ruta relativa a l'arrel del projecte.
        this.fileStorageLocation = Paths.get("user-content").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Guarda un arxiu al sistema de fitxers.
     * @param file L'arxiu rebut des del controlador.
     * @return El nom únic generat per a l'arxiu guardat.
     */
    public String storeFile(MultipartFile file) {
        // Normalitza el nom de l'arxiu per seguretat.
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Comprova si el nom de l'arxiu conté caràcters invàlids.
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            // Genera un nom d'arxiu únic per evitar col·lisions (ex: imatge.png -> 123e4567-e89b-12d3-a456-426614174000.png)
            String fileExtension = "";
            try {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            } catch (Exception e) {
                // No extension
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            // Construeix la ruta final de l'arxiu.
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            // Copia l'arxiu a la ubicació de destí, reemplaçant-lo si ja existeix.
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    /**
     * Carrega un arxiu com a recurs a partir del seu nom.
     * @param fileName El nom de l'arxiu a carregar.
     * @return El recurs (Resource) que pot ser enviat a l'usuari.
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    /**
     * Esborra un arxiu del sistema de fitxers.
     * @param fileName El nom de l'arxiu a esborrar.
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            // Esborra l'arxiu només si existeix per evitar errors.
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }
}
