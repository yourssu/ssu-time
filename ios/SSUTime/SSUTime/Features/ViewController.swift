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
        "교내 일정", "교내 장학금", "외부 공모전", "내부 공모전", "교내 행사", "교외 행사"
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
    private let toggle2 = ToggleRowView(title: "일주일에 한 번", icon: UIImage(systemName: "bell.fill"), isOn: false)
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

        [toggle1, toggle2, toggle3].forEach { toggleStackView.addArrangedSubview($0) }

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
        toggle2.setToggleAction { isOn in
            print("일주일에 한 번:", isOn)
        }
        toggle3.setToggleAction { isOn in
            print("업데이트될 때마다 한 번:", isOn)
        }

        categoryView.onSelectionChanged = { selectedTags in
            print("선택된 태그:", selectedTags)
        }

        addCalendarButton.addTarget(self, action: #selector(addCalendarTapped), for: .touchUpInside)
    }

    @objc private func addCalendarTapped() {
        print("캘린더에 추가 버튼이 눌림.")
    }
}
