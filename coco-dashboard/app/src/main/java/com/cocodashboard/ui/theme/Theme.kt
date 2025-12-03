package com.cocodashboard.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = SeafoamPrimary,
    onPrimary = Color.White,
    secondary = SandSecondary,
    onSecondary = Color.White,
    tertiary = SunsetTertiary,
    background = MistSurface,
    surface = Color.White,
    onSurface = Color(0xFF0B1F26)
)

private val DarkColors = darkColorScheme(
    primary = SeafoamPrimary,
    onPrimary = Color.White,
    secondary = SandSecondary,
    onSecondary = Color.White,
    tertiary = SunsetTertiary,
    background = SlateBackground,
    surface = SlateBackground,
    onSurface = Color.White
)

@Composable
fun CocoDashboardTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors

    MaterialTheme(
        colorScheme = colorScheme,
        typography = CocoTypography,
        content = content
    )
}