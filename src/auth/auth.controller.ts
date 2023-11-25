import {Controller, Post, UseGuards, Get} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { AuthGuardLocal } from "./auth-guard.local";
import { AuthGuardJwt } from "./auth-guard.jwt";
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('login')
  @UseGuards(AuthGuardLocal)
  async login(@CurrentUser() user) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user)
    }
  }

  @Get('profile')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user) {
    return user;
  }

}