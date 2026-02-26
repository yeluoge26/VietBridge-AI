// ============================================================================
// VietBridge AI — Learn View Model
// Daily phrases, scenes, phrase library
// ============================================================================

import SwiftUI

@Observable
@MainActor
final class LearnViewModel {
    var selectedTab = 0
    var selectedScene: String?

    var todayPhrases: [DailyPhrase] {
        // Rotate daily based on date
        let day = Calendar.current.component(.day, from: Date())
        let startIndex = (day * 3) % DailyPhrase.allPhrases.count
        var result: [DailyPhrase] = []
        for i in 0..<3 {
            let index = (startIndex + i) % DailyPhrase.allPhrases.count
            result.append(DailyPhrase.allPhrases[index])
        }
        return result
    }

    var filteredPhrases: [DailyPhrase] {
        if let scene = selectedScene {
            return DailyPhrase.allPhrases.filter { $0.scene == scene }
        }
        return DailyPhrase.allPhrases
    }

    var scenes: [SceneInfo] {
        SceneInfo.allScenes
    }
}
