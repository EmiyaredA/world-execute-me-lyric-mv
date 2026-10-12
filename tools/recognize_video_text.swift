// macOS Vision OCR for local reference frames. Output stays in ignored out/.
import Foundation
import Vision

for path in CommandLine.arguments.dropFirst() {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["en-US"]
    request.usesLanguageCorrection = true
    request.minimumTextHeight = 0.006
    do {
        try VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:]).perform([request])
        let rows: [[String: Any]] = (request.results ?? []).map { item in
            ["box": [item.boundingBox.origin.x, item.boundingBox.origin.y, item.boundingBox.width, item.boundingBox.height],
             "candidates": item.topCandidates(3).map { ["text": $0.string, "confidence": $0.confidence] }]
        }
        let data = try JSONSerialization.data(withJSONObject: ["file": path, "rows": rows], options: [.sortedKeys])
        print(String(decoding: data, as: UTF8.self))
        fflush(stdout)
    } catch {
        fputs("OCR failed for \(path): \(error)\n", stderr)
        exit(1)
    }
}
