"use client";

import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";

const features = [
  { emoji: "🥦", title: "Track Your Pantry", description: "Add and manage ingredients you already have at home." },
  { emoji: "🤖", title: "AI Recipe Suggestions", description: "Get recipes generated from your pantry ingredients using AI." },
  { emoji: "🔍", title: "Search Ingredients", description: "Quickly find items in your pantry with instant search." },
];

export default function LandingPage() {
  const router = useRouter();

  async function handleGuestSignIn() {
    try {
      await signInAnonymously(auth);
      router.push("/dashboard");
    } catch (err) {
      console.error("Guest sign-in failed:", err.message);
    }
  }

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={4}
      px={2}
      py={6}
    >
      <Stack textAlign="center" alignItems="center" gap={1} sx={{
        width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
      }}>
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(90deg, #0000FF, #00FFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Mealwise
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Generate recipes from ingredients in your pantry
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" size="large" component={Link} href="/dashboard"
          sx={{ textTransform: "none", px: 4 }}>
          Get Started
        </Button>
        <Button variant="outlined" size="large" onClick={handleGuestSignIn}
          sx={{ textTransform: "none", px: 4 }}>
          Try as Guest
        </Button>
      </Stack>

      <Divider sx={{ width: { xs: "90%", md: "60%" } }} />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        sx={{ width: { xs: "90%", sm: "80%", md: "70%", lg: "60%" } }}
      >
        {features.map(({ emoji, title, description }) => (
          <Card key={title} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography fontSize="2rem">{emoji}</Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
              <Typography variant="body2" color="text.secondary">{description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "60%" },
          border: "2px solid #e0e0e0",
          borderRadius: 3,
          p: 3,
          bgcolor: "#f9f9f9",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>Your Pantry</Typography>
        <Stack spacing={1}>
          {["Chicken", "Garlic", "Tomatoes"].map((item) => (
            <Box key={item} display="flex" justifyContent="space-between" alignItems="center"
              sx={{ bgcolor: "lightblue", borderRadius: 1, px: 2, py: 1 }}>
              <Typography fontWeight="bold">{item}</Typography>
              <Typography variant="body2" color="text.secondary">Quantity: 2</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
