namespace O7TaskFlow.Application.DTOs.Auth;

public record ChangePasswordDto(
    string OldPassword,
    string NewPassword
);