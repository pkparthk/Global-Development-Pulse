import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, useRegister } from "@/services/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      )
      .refine((password) => !/^\d+$/.test(password), {
        message: "Password cannot be only numbers",
      }),
    password_confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useAuth();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
    notOnlyNumbers: !/^\d+$/.test(password) && password.length > 0,
  };

  // Calculate password strength
  const passwordStrength = () => {
    if (!password) return { score: 0, label: "", color: "" };

    const checks = Object.values(passwordChecks);
    const passedChecks = checks.filter(Boolean).length;

    if (passedChecks <= 2)
      return { score: 25, label: "Weak", color: "bg-red-500" };
    if (passedChecks === 3)
      return { score: 50, label: "Fair", color: "bg-yellow-500" };
    if (passedChecks === 4)
      return { score: 75, label: "Good", color: "bg-blue-500" };
    if (passedChecks === 5)
      return { score: 100, label: "Strong", color: "bg-green-500" };

    return { score: 0, label: "", color: "" };
  };

  const strength = passwordStrength();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Global Development Pulse
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Join our analytics platform
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Fill in your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="First Name"
                    {...register("first_name")}
                    className={`h-11 ${
                      errors.first_name
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Last Name"
                    {...register("last_name")}
                    className={`h-11 ${
                      errors.last_name
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  {...register("username")}
                  className={`h-11 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@example.com"
                  {...register("email")}
                  className={`h-11 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`h-11 pr-12 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Password Strength:</span>
                      <span
                        className={`font-medium ${
                          strength.score >= 75
                            ? "text-green-600"
                            : strength.score >= 50
                            ? "text-blue-600"
                            : strength.score >= 25
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.password.message}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="space-y-1 ml-2">
                    <li className="flex items-center gap-1">
                      <span
                        className={
                          passwordChecks.length
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {passwordChecks.length ? "✓" : "○"}
                      </span>{" "}
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-1">
                      <span
                        className={
                          passwordChecks.hasLetter
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {passwordChecks.hasLetter ? "✓" : "○"}
                      </span>{" "}
                      At least one letter (a-z or A-Z)
                    </li>
                    <li className="flex items-center gap-1">
                      <span
                        className={
                          passwordChecks.hasNumber
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {passwordChecks.hasNumber ? "✓" : "○"}
                      </span>{" "}
                      At least one number (0-9)
                    </li>
                    <li className="flex items-center gap-1">
                      <span
                        className={
                          passwordChecks.hasSpecial
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {passwordChecks.hasSpecial ? "✓" : "○"}
                      </span>{" "}
                      At least one special character (!@#$%^&*)
                    </li>
                    <li className="flex items-center gap-1">
                      <span
                        className={
                          passwordChecks.notOnlyNumbers
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordChecks.notOnlyNumbers ? "✓" : "✗"}
                      </span>{" "}
                      Cannot be only numbers
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    {...register("password_confirm")}
                    className={`h-11 pr-12 ${
                      errors.password_confirm
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.password_confirm.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
