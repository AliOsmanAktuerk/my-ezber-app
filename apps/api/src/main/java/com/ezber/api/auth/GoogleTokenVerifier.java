package com.ezber.api.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleTokenVerifier {
    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(clientId == null || clientId.isBlank() ? List.of("missing-google-client-id") : List.of(clientId))
            .build();
    }

    public GoogleUser verify(String credential) {
        if (clientId == null || clientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google Login ist noch nicht konfiguriert");
        }

        try {
            var idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google Token ist ungültig");
            }

            var payload = idToken.getPayload();

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google E-Mail ist nicht verifiziert");
            }

            return new GoogleUser((String) payload.get("name"), payload.getEmail());
        } catch (GeneralSecurityException | IOException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google Token konnte nicht geprüft werden");
        }
    }

    public record GoogleUser(String name, String email) {
    }
}
