package app.mythiccompanions.MythicCompanions.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("user-content");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/user-content/**")
                .addResourceLocations("file:/" + uploadPath + "/");
    }
}