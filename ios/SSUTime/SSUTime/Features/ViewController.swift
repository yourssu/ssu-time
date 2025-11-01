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

    private let toggleStackView: UIStackView = {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
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
        contentView.addSubview(toggleStackView)

        [toggle1, toggle2, toggle3].forEach { toggleStackView.addArrangedSubview($0) }

        scrollView.snp.makeConstraints {
            $0.edges.equalToSuperview()
        }

        contentView.snp.makeConstraints {
            $0.edges.equalToSuperview()
            $0.width.equalToSuperview()
        }

        toggleStackView.snp.makeConstraints {
            $0.top.equalToSuperview().offset(160)
            $0.leading.trailing.equalToSuperview().inset(20)
            $0.bottom.equalToSuperview().offset(-24)
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
    }
}
