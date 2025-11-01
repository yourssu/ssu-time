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

    private let categoryView = SelectableTagView(tags: [
        "교내 일정", "교내 장학금", "외부 공모전", "내부 공모전", "교내 행사", "교외 행사"
    ])

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

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()
        setupActions()
    }

    // MARK: - Setup
    private func setupLayout() {
        view.backgroundColor = .white

        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        contentView.addSubviews(categoryView, toggleStackView)

        [toggle1, toggle2, toggle3].forEach { toggleStackView.addArrangedSubview($0) }

        scrollView.snp.makeConstraints {
            $0.edges.equalTo(view.safeAreaLayoutGuide)
        }

        contentView.snp.makeConstraints {
            $0.edges.equalToSuperview()
            $0.width.equalTo(scrollView.snp.width)
        }

        categoryView.snp.makeConstraints {
            $0.top.equalToSuperview().offset(24)
            $0.leading.trailing.equalToSuperview().inset(20)
            $0.height.greaterThanOrEqualTo(120)
        }

        toggleStackView.snp.makeConstraints {
            $0.top.equalTo(categoryView.snp.bottom).offset(32)
            $0.leading.trailing.equalToSuperview().inset(20)
            $0.bottom.equalToSuperview().offset(-40)
        }
    }

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
    }
}
