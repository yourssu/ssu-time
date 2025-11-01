//
//  SSUTimeWidget.swift
//  SSUTimeWidget
//
//  Created by 박현수 on 11/1/25.
//

import WidgetKit
import SwiftUI
import Foundation

struct Provider: TimelineProvider {
    enum ProviderError: LocalizedError {
        case invalidURL
        case decodeDidFail
        case fetchEventDidFail

        var errorDescription: String? {
            switch self {
            case .invalidURL:
                return "URL이 올바르지 않습니다."
            case .decodeDidFail:
                return "디코딩에 실패했습니다."
            case .fetchEventDidFail:
                return "이벤트를 불러오는 데 실패했습니다."
            }
        }
    }

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), event: "D-3")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        Task {
            do {
                let event = try await fetchUpcomingEvent()
                let entry = SimpleEntry(date: .now, event: event.description)
                completion(entry)
            } catch {
                completion(.init(date: .now, event: ""))
            }
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            do {
                let event = try await fetchUpcomingEvent()
                let entry = SimpleEntry(date: .now, event: event.description)

                let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: .now)!
                let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
                completion(timeline)
            } catch {
                let fallback = SimpleEntry(date: .now, event: error.localizedDescription)
                let timeline = Timeline(entries: [fallback], policy: .after(.now.addingTimeInterval(300)))
                completion(timeline)
            }
        }
    }

    func fetchUpcomingEvent() async throws -> UpcomingEvent {
        guard let url = URL(string: "https://jsonplaceholder.typicode.com/todos/1") else {
            throw ProviderError.invalidURL
        }
        let (data, _) = try await URLSession.shared.data(from: url)
        return UpcomingEvent(description: String(data: data, encoding: .utf8) ?? "")
    }

//    func relevances() async -> WidgetRelevances<Void> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct UpcomingEvent: Decodable {
    let description: String
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let event: String
}

struct SSUTimeWidgetEntryView : View {
    @AppStorage("uuid", store: .Group.shared) var authUUID: String = ""

    private static let formatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ko_KR")
        formatter.dateFormat = "MM월 dd일"
        return formatter
    }()

    var entry: Provider.Entry

    var body: some View {
        VStack {
            Text(Self.formatter.string(from: entry.date))
            Text(entry.event.prefix(10))
            Text(authUUID)
            Button("test") {
                print(authUUID)
            }
        }
        .onAppear { print(authUUID) }
    }
}

struct SSUTimeWidget: Widget {
    let kind: String = "SSUTimeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                SSUTimeWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                SSUTimeWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("SSUTime Widget")
        .description("다가오는 이벤트를 위젯으로 확인하세요.")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    SSUTimeWidget()
} timeline: {
    SimpleEntry(date: .now, event: "🤩")
}
