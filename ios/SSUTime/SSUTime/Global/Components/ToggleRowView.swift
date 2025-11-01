//
//  ToggleRowView.swift
//  PixoTest
//
//  Created by 성현주 on 11/01/25.
//

import UIKit

final class ToggleRowView: UIView {

    // MARK: - Properties
    private var pulseAnimationKey = "borderPulseAnimation"

    // MARK: - UI Components
    private let iconImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.tintColor = .systemBlue
        imageView.setContentHuggingPriority(.defaultHigh, for: .horizontal)
        return imageView
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 16, weight: .medium)
        label.textColor = .darkGray
        return label
    }()

    private let toggleSwitch: UISwitch = {
        let toggle = UISwitch()
        toggle.onTintColor = .systemBlue
        return toggle
    }()

    // MARK: - Lifecycle
    init(title: String, icon: UIImage? = nil, isOn: Bool = false) {
        super.init(frame: .zero)
        setupUI()
        configure(title: title, icon: icon, isOn: isOn)
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
    }

    // MARK: - Setup Methods
    private func setupUI() {
        backgroundColor = .systemGray6
        layer.cornerRadius = 16
        layer.masksToBounds = true
        layer.borderColor = UIColor.clear.cgColor
        layer.borderWidth = 1.5

        addSubviews(iconImageView, titleLabel, toggleSwitch)
        [iconImageView, titleLabel, toggleSwitch].forEach { $0.translatesAutoresizingMaskIntoConstraints = false }

        NSLayoutConstraint.activate([
            heightAnchor.constraint(equalToConstant: 60),

            iconImageView.centerYAnchor.constraint(equalTo: centerYAnchor),
            iconImageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            iconImageView.widthAnchor.constraint(equalToConstant: 22),
            iconImageView.heightAnchor.constraint(equalToConstant: 22),

            titleLabel.centerYAnchor.constraint(equalTo: centerYAnchor),
            titleLabel.leadingAnchor.constraint(equalTo: iconImageView.trailingAnchor, constant: 12),

            toggleSwitch.centerYAnchor.constraint(equalTo: centerYAnchor),
            toggleSwitch.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16)
        ])
    }

    // MARK: - Actions
    func setToggleAction(_ action: @escaping (Bool) -> Void) {
        toggleSwitch.addAction(UIAction { [weak self] _ in
            guard let self = self else { return }
            action(self.toggleSwitch.isOn)
        }, for: .valueChanged)
    }

    // MARK: - Public Methods
    func setToggleState(_ isOn: Bool) {
        toggleSwitch.setOn(isOn, animated: true)
    }

    func getToggleState() -> Bool {
        return toggleSwitch.isOn
    }

    func startHighlightAnimation() {
        guard layer.animation(forKey: pulseAnimationKey) == nil else { return }
        layer.borderColor = UIColor.systemBlue.withAlphaComponent(0.5).cgColor

        let pulse = CABasicAnimation(keyPath: "borderColor")
        pulse.fromValue = UIColor.systemBlue.withAlphaComponent(0.2).cgColor
        pulse.toValue = UIColor.systemBlue.withAlphaComponent(0.6).cgColor
        pulse.duration = 0.9
        pulse.autoreverses = true
        pulse.repeatCount = 4
        layer.add(pulse, forKey: pulseAnimationKey)
    }

    func stopHighlightAnimation() {
        layer.removeAnimation(forKey: pulseAnimationKey)
        layer.borderColor = UIColor.clear.cgColor
    }

    // MARK: - Private Methods
    private func configure(title: String, icon: UIImage?, isOn: Bool) {
        titleLabel.text = title
        toggleSwitch.isOn = isOn
        iconImageView.image = icon?.withRenderingMode(.alwaysTemplate)
    }
}
