package app.mythiccompanions.MythicCompanions.service;

import app.mythiccompanions.MythicCompanions.auth.AuthResponse;
import app.mythiccompanions.MythicCompanions.auth.LoginRequest;
import app.mythiccompanions.MythicCompanions.auth.RegisterRequest;
import app.mythiccompanions.MythicCompanions.enums.Role;
import app.mythiccompanions.MythicCompanions.jwt.JwtService;
import app.mythiccompanions.MythicCompanions.model.User;
import app.mythiccompanions.MythicCompanions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Authenticates a user and returns a JWT token.
     * @param request The login request containing username and password.
     * @return An AuthResponse with the token and user details.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .build();
    }

    /**
     * Registers a new user in the system.
     * @param request The registration request containing user details.
     * @return An AuthResponse with the token for the newly created user.
     */
    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(Role.USER) // By default, all new users are USERs
                .build();

        userRepository.save(user);

        String token = jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .build();
    }
}
