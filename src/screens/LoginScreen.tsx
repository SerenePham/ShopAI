import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ShopButton from "@components/ui/ShopButton";
import ShopInput from "@components/ui/ShopInput";
import { COLORS, SIZES } from "@constants/theme";

// Chú ý: Ở bài này ta truyền giả lập onLogin qua Props để hiểu Auth Flow.
// Ở chương sau ta sẽ đổi sang dùng Zustand để tránh Prop Drilling.
const LoginScreen = ({
  onLogin,
  onGoRegister,
}: {
  onLogin: (token: string) => void;
  onGoRegister: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  // Validate đơn giản: Email phải chứa @, Mật khẩu tối thiểu 6 ký tự
  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.includes("@")) next.email = "Email không hợp lệ (phải chứa @)";
    if (password.length < 6) next.password = "Mật khẩu phải có ít nhất 6 ký tự";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    // Giả lập gọi API server
    setTimeout(() => {
      setLoading(false);
      onLogin("mock_token_123"); // Cấp token
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopAI</Text>
      <Text style={styles.subtitle}>Vui lòng đăng nhập để tiếp tục</Text>

      <ShopInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ShopInput
        label="Mật khẩu"
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
      />

      <ShopButton
        title="Đăng nhập ngay"
        onPress={handleLogin}
        isLoading={loading}
        style={styles.loginBtn}
      />

      {/* Liên kết sang màn Đăng ký trong cùng AuthStack (Bước 2.5) */}
      <Pressable onPress={onGoRegister} style={styles.registerLink}>
        <Text style={styles.registerLinkText}>
          Chưa có tài khoản?{" "}
          <Text style={styles.registerLinkBold}>Đăng ký</Text>
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SIZES.padding,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: SIZES.body1,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 32,
  },
  loginBtn: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerLinkText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default LoginScreen;