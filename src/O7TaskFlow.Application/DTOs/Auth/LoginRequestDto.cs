namespace O7TaskFlow.Application.DTOs.Auth;

public record LoginRequestDto(
    string User,
    string Password,
    string Company,
    string Branch
);