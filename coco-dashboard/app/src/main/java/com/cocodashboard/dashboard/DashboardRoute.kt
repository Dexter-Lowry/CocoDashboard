package com.cocodashboard.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.cocodashboard.ui.theme.CocoDashboardTheme

@Composable
fun DashboardRoute(
    viewModel: DashboardViewModel = viewModel()
) {
    val cards by viewModel.cards.collectAsStateWithLifecycle()

    DashboardScreen(
        cards = cards,
        onRefresh = viewModel::refresh
    )
}

class DashboardViewModel : ViewModel() {
    private val _cards = MutableStateFlow(createLoadingCards())
    val cards: StateFlow<List<DashboardCardModel>> = _cards.asStateFlow()

    init {
        simulateLoading()
    }

    fun refresh() {
        simulateLoading()
    }

    private fun simulateLoading() {
        viewModelScope.launch {
            _cards.value = createLoadingCards()
            delay(1200)
            _cards.value = demoCardContent()
        }
    }
}

private fun createLoadingCards(): List<DashboardCardModel> = DashboardCardType.values().map { type ->
    DashboardCardModel(
        type = type,
        title = type.title,
        subtitle = type.subtitle,
        state = DashboardCardState.Loading
    )
}

private fun demoCardContent(): List<DashboardCardModel> = listOf(
    DashboardCardModel(
        type = DashboardCardType.ROCKETS,
        title = DashboardCardType.ROCKETS.title,
        subtitle = DashboardCardType.ROCKETS.subtitle,
        state = DashboardCardState.Content(
            headline = "Next launch: Falcon 9 • Starlink",
            body = "Liftoff NET 9:36 PM — SLC-40 — Weather 80% go"
        )
    ),
    DashboardCardModel(
        type = DashboardCardType.TIDES,
        title = DashboardCardType.TIDES.title,
        subtitle = DashboardCardType.TIDES.subtitle,
        state = DashboardCardState.Content(
            headline = "High tide 4:32 PM",
            body = "Next low tide 10:41 PM • -0.2 ft"
        )
    ),
    DashboardCardModel(
        type = DashboardCardType.MUSIC,
        title = DashboardCardType.MUSIC.title,
        subtitle = DashboardCardType.MUSIC.subtitle,
        state = DashboardCardState.Content(
            headline = "Juice & the Jets",
            body = "Cocoa Beach Bandshell • Fri 8 PM"
        )
    ),
    DashboardCardModel(
        type = DashboardCardType.LIVE_VIEW,
        title = DashboardCardType.LIVE_VIEW.title,
        subtitle = DashboardCardType.LIVE_VIEW.subtitle,
        state = DashboardCardState.Content(
            headline = "Live beach cam",
            body = "Tap to open stream"
        )
    )
)

enum class DashboardCardType(val title: String, val subtitle: String) {
    ROCKETS("Rocket Tracker", "Cape & KSC launches"),
    TIDES("Tide Status", "Daily highs & lows"),
    MUSIC("Live Music", "Upcoming local shows"),
    LIVE_VIEW("Beach Cam", "Live view of Cocoa Beach")
}

sealed interface DashboardCardState {
    data object Loading : DashboardCardState
    data class Content(val headline: String, val body: String) : DashboardCardState
    data class Error(val message: String) : DashboardCardState
}

data class DashboardCardModel(
    val type: DashboardCardType,
    val title: String,
    val subtitle: String,
    val state: DashboardCardState
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    cards: List<DashboardCardModel>,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Coco Beach Dashboard",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Text(
                            text = "Your tide, launch & music glance",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                },
                actions = {
                    TextButton(onClick = onRefresh) {
                        Text("Refresh")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 180.dp),
            modifier = Modifier
                .padding(padding)
                .padding(horizontal = 16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(cards, key = { it.type }) { card ->
                DashboardCard(card = card)
            }
        }
    }
}

@Composable
private fun DashboardCard(card: DashboardCardModel, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 150.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        )
    ) {
        Column(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(text = card.title, style = MaterialTheme.typography.titleMedium)
                Text(
                    text = card.subtitle,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            when (val state = card.state) {
                DashboardCardState.Loading -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator()
                        Text(
                            text = "Loading data...",
                            style = MaterialTheme.typography.bodyLarge,
                            modifier = Modifier.padding(top = 12.dp)
                        )
                    }
                }
                is DashboardCardState.Content -> {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = state.headline,
                            style = MaterialTheme.typography.bodyLarge,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = state.body,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                is DashboardCardState.Error -> {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Something went wrong",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.error
                        )
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.bodyMedium,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )
                        TextButton(onClick = { /* TODO: route retry to controller */ }) {
                            Text("Try again")
                        }
                    }
                }
            }
        }
    }
}

@Preview(showSystemUi = true)
@Composable
private fun DashboardScreenPreview() {
    CocoDashboardTheme {
        val cards = remember { demoCardContent() }
        DashboardScreen(cards = cards, onRefresh = {})
    }
}
