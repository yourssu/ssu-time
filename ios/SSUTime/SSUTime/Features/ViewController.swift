//
//  ViewController.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import UIKit
import SnapKit

final class ViewController: UIViewController {

    // MARK: - UI Components
    private let scrollView = UIScrollView()
    private let contentView = UIView()

    private let categoryTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "캘린더 카테고리"
        label.font = .systemFont(ofSize: 18, weight: .semibold)
        label.textColor = .black
        return label
    }()

    private let categoryView = SelectableTagView(tags: [
        "기본형", "총학생회", "외부 공모전", "내부 공모전", "교내 행사", "교외 행사"
    ])

    private let alertTitleLabel: UILabel = {
        let label = UILabel()
        label.text = "알림 설정"
        label.font = .systemFont(ofSize: 18, weight: .semibold)
        label.textColor = .black
        return label
    }()

    private let toggleStackView: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
        stack.alignment = .fill
        stack.distribution = .equalSpacing
        return stack
    }()

    private let toggle1 = ToggleRowView(title: "하루에 한 번", icon: UIImage(systemName: "bell.fill"), isOn: false)
    private let toggle3 = ToggleRowView(title: "업데이트될 때마다 한 번", icon: UIImage(systemName: "bell.fill"), isOn: false)

    private let bottomContainerView = UIView()
    private let addCalendarButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("캘린더에 추가", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        button.backgroundColor = .systemBlue
        button.layer.cornerRadius = 12
        button.clipsToBounds = true
        return button
    }()

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupNavigation()
        setupLayout()
        setupActions()
    }

    // MARK: - Navigation Setup
    private func setupNavigation() {
        title = "Calendar"
        navigationController?.navigationBar.prefersLargeTitles = true
        navigationItem.largeTitleDisplayMode = .always
    }

    // MARK: - LayoutSetup
    private func setupLayout() {
        view.backgroundColor = .white

        view.addSubview(scrollView)
        view.addSubview(bottomContainerView)

        scrollView.addSubview(contentView)
        contentView.addSubviews(categoryTitleLabel, categoryView, alertTitleLabel, toggleStackView)
        bottomContainerView.addSubview(addCalendarButton)

        [toggle1, toggle3].forEach { toggleStackView.addArrangedSubview($0) }

        scrollView.snp.makeConstraints {
            $0.top.leading.trailing.equalTo(view.safeAreaLayoutGuide)
            $0.bottom.equalTo(bottomContainerView.snp.top)
        }

        contentView.snp.makeConstraints {
            $0.edges.equalToSuperview()
            $0.width.equalTo(scrollView.snp.width)
        }

        categoryTitleLabel.snp.makeConstraints {
            $0.top.equalToSuperview().offset(24)
            $0.leading.trailing.equalToSuperview().inset(20)
        }

        categoryView.snp.makeConstraints {
            $0.top.equalTo(categoryTitleLabel.snp.bottom).offset(12)
            $0.leading.trailing.equalToSuperview().inset(20)
        }

        alertTitleLabel.snp.makeConstraints {
            $0.top.equalTo(categoryView.snp.bottom).offset(64)
            $0.leading.trailing.equalToSuperview().inset(20)
        }

        toggleStackView.snp.makeConstraints {
            $0.top.equalTo(alertTitleLabel.snp.bottom).offset(12)
            $0.leading.trailing.equalToSuperview().inset(20)
            $0.bottom.equalToSuperview().offset(-40)
        }

        bottomContainerView.snp.makeConstraints {
            $0.leading.trailing.bottom.equalTo(view.safeAreaLayoutGuide)
            $0.height.equalTo(80)
        }

        addCalendarButton.snp.makeConstraints {
            $0.top.equalToSuperview().offset(12)
            $0.leading.trailing.equalToSuperview().inset(20)
            $0.height.equalTo(52)
        }
    }

    // MARK: - Actions
    private func setupActions() {
        toggle1.setToggleAction { isOn in
            print("하루에 한 번:", isOn)
        }
        toggle3.setToggleAction { isOn in
            print("업데이트될 때마다 한 번:", isOn)
        }

        categoryView.onSelectionChanged = { selectedTags in
            print("선택된 태그:", selectedTags)
        }

        addCalendarButton.addTarget(self, action: #selector(addCalendarTapped), for: .touchUpInside)
    }

    // MARK: - webcal parser
    @objc private func addCalendarTapped() {
        print("webcal 캘린더 추가 시도")

        guard let url = URL(string: "webcal://seyeona-ha.github.io/ssu-calendar/ssu_2025_09.ics") else {
            print("잘못된 webcal URL")
            return
        }

        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url, options: [:]) { success in
                if success {
                    print("캘린더 구독 화면으로 이동됨")
                } else {
                    print("캘린더 구독 화면 열기 실패")
                }
            }
        } else {
            print("webcal 스킴을 열 수 없습니다. (Info.plist 설정 확인 필요)")
            showOpenInSafariAlert(for: url)
        }
    }

    //TODO: - API 통신연결이후 수정
    private func showOpenInSafariAlert(for url: URL) {
        let alert = UIAlertController(
            title: "캘린더 열기 실패",
            message: "Safari에서 직접 열어보시겠어요?",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "취소", style: .cancel))
        alert.addAction(UIAlertAction(title: "Safari로 열기", style: .default, handler: { _ in
            let httpsURL = URL(string: "https://" + url.absoluteString.replacingOccurrences(of: "webcal://", with: ""))!
            UIApplication.shared.open(httpsURL)
        }))
        present(alert, animated: true)
    }
}
